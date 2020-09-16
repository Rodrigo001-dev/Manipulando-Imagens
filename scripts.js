const photoFile = document.getElementById('photo-file')
let photoPreview = document.getElementById('photo-preview');
let image;
let photoName;

// Select & Preview image

document.getElementById('select-image')
  .onclick = function() {
    photoFile.click();
  }

window.addEventListener('DOMContentLoaded', () => {
  photoFile.addEventListener('change', () => {
    let file = photoFile.files.item(0);
    photoName = file.name;

    // ler um arquivo
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
      image = new Image();
      image.src = event.target.result; // pega o resultado do reader o coloca com src da image
      image.onload = onLoadImage;
    }; // Sempre que o leitor terminar de carregar ele vai executar uma função.
      // Para dentro dessa função ele envia o event que foi o carregamento(load).
      // O event tem o target que seria o alvo(qual é o alvo) do event. O alvo é justamente o reader(quem diparou)
  });
});

// Selection tool

const selection = document.getElementById('selection-tool');

let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY;
let startSelection = false;

const events = {
  mouseover() {
    this.style.cursor = 'crosshair' // O this é o target que está disparando o evento(image)
  },
  mousedown() { // clicou no mouse
    const { clientX, clientY, offsetX, offsetY } = event;
    // console.table({
    //   'client': [clientX, clientY],
    //   'offset': [offsetX, offsetY]
    // });

    startX = clientX;
    startY = clientY;
    relativeStartX = offsetX;
    relativeStartY = offsetY;

    startSelection = true;
  },
  mousemove() { // mouse em movimento
    endX = event.clientX;
    endY = event.clientY;

    if (startSelection) {
      selection.style.display = 'initial';
      selection.style.top = startY + 'px';
      selection.style.left = startX + 'px';

      selection.style.width = (endX - startX) + 'px';
      selection.style.height = (endY - startY) + 'px';
    }
  },
  mouseup() { // parou de clicar no mouse
    startSelection = false;

    relativeEndX = event.layerX; // layerX = é o cálculo Horizontal de onde o mouse está na tela
    relativeEndY = event.layerY; // layerY = é o cálculo Vertical de onde o mouse está na tela

    // mostrar o botão de corte
    cropButton.style.display = 'initial';
  },
};

Object.keys(events) // pegar as chaves de um objeto e vai trasformar isso em um array de chaves
.forEach((eventName) => { // está pegando um item e está rodando a funcionalidade. Só que ele passa com um parâmetro o eventName
  photoPreview.addEventListener(eventName, events[eventName]); // eventName =  mouseover mousedown  mousemovemouseup
}); 

// Canvas
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d'); // Pegando o contexto

function onLoadImage() {
  const { width, height } = image;
  canvas.width = width;
  canvas.height = height;

  // limpar o contexto
  ctx.clearRect(0, 0, width, height);

  // desenhar a imagem no contexto
  ctx.drawImage(image, 0, 0); // Vai começar a desenhar a imagem do X=0 e Y=0 para desenhar toda a imagem

  photoPreview.src = canvas.toDataURL()
}

// Cortar imagem

const cropButton = document.getElementById('crop-image');
cropButton.onclick = () => {
  const { width: imgW, height: imgH } = image;
  const { width: previewW, height: previewH } = photoPreview;

  const [ widthFactor, heightFactor ] = [
    +(imgW / previewW),
    +(imgH / previewH),
  ];

  const [ selectionWidth, selectionHeight ]  = [
    +selection.style.width.replace('px', ''),
    +selection.style.height.replace('px', ''),
  ];

  const [ croppedWidth, croppedHeight ] = [
    +(selectionWidth * widthFactor),
    +(selectionHeight * heightFactor)
  ];

  const [ actualX, actualY ] = [ // Posições reais de X e Y 
    +( relativeStartX * widthFactor ),
    +( relativeStartY * heightFactor )
  ];

  // pegar do ctx da imagem cortada
  const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight);

  // limpar o ctx do canvas
  ctx.clearRect(0, 0, ctx.width, ctx.height);

  // ajuste de proporções
  image.width = canvas.width = croppedWidth;
  image.height = canvas.height = croppedHeight;

  // adicionar a imagem cortada ao ctx
  ctx.putImageData(croppedImage, 0, 0);

  // esconder a ferramenta de seleção
  selection.style.display = 'none';

  // atualizar o preview da imagem
  photoPreview.src = canvas.toDataURL();

  // mostrar o botão de download
  downloadButton.style.display = 'initial'
};

// Download
const downloadButton = document.getElementById('download');
downloadButton.onclick = function() {
  const a = document.createElement('a');
  a.download = photoName + '-cropped.png';
  a.href = canvas.toDataURL();
  a.click();
};