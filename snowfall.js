let nieve_cantidad = 10;
let nieve_colorr = ["#aaaacc", "#ddddFF", "#ccccDD"];
let nieve_tipo = ["Arial Black", "Arial Narrow", "Times", "Comic Sans MS"];
let nieve_letra = "❅";
let nieve_velocidad = 1.0;
let nieve_cantidadsize = 20;
let nieve_chico = 8;
let nieve_zona = 1;

let nieve = [];
let marginbottom;
let marginright;
let x_mv = [];
let crds = [];
let lftrght = [];
let browserinfos = navigator.userAgent;
let ie5 =
  document.all && document.getElementById && !browserinfos.match(/Opera/);
let ns6 = document.getElementById && !document.all;
let opera = browserinfos.match(/Opera/);
let browserok = ie5 || ns6 || opera;

function aleatorio(range) {
  return Math.floor(range * Math.random());
}

function initnieve() {
  marginbottom = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  marginright = Math.max(
    document.body.clientWidth,
    document.documentElement.clientWidth
  );

  let nievesizerange = nieve_cantidadsize - nieve_chico;

  for (let i = 0; i <= nieve_cantidad; i++) {
    crds[i] = 0;
    lftrght[i] = Math.random() * 15;
    x_mv[i] = 0.03 + Math.random() / 10;

    let span = document.createElement("span");
    span.id = "s" + i;
    span.style.position = "absolute";
    span.style.top = "-" + nieve_cantidadsize + "px";
    span.style.fontFamily = nieve_tipo[aleatorio(nieve_tipo.length)];
    span.style.fontSize = aleatorio(nievesizerange) + nieve_chico + "px";
    span.style.color = nieve_colorr[aleatorio(nieve_colorr.length)];
    span.textContent = nieve_letra;
    document.body.appendChild(span);

    nieve[i] = span;
    nieve[i].sink = (nieve_velocidad * parseInt(nieve[i].style.fontSize)) / 5;

    if (nieve_zona == 1) {
      nieve[i].posx = aleatorio(
        marginright - parseInt(nieve[i].style.fontSize)
      );
    } else if (nieve_zona == 2) {
      nieve[i].posx = aleatorio(
        marginright / 2 - parseInt(nieve[i].style.fontSize)
      );
    } else if (nieve_zona == 3) {
      nieve[i].posx =
        aleatorio(marginright / 2 - parseInt(nieve[i].style.fontSize)) +
        marginright / 4;
    } else if (nieve_zona == 4) {
      nieve[i].posx =
        aleatorio(marginright / 2 - parseInt(nieve[i].style.fontSize)) +
        marginright / 2;
    }

    nieve[i].posy = aleatorio(
      2 * marginbottom - marginbottom - 2 * parseInt(nieve[i].style.fontSize)
    );
    nieve[i].style.left = nieve[i].posx + "px";
    nieve[i].style.top = nieve[i].posy + "px";
  }

  movenieve();
}

function movenieve() {
  for (let i = 0; i <= nieve_cantidad; i++) {
    crds[i] += x_mv[i];
    nieve[i].posy += nieve[i].sink;
    nieve[i].style.left = nieve[i].posx + lftrght[i] * Math.sin(crds[i]) + "px";
    nieve[i].style.top = nieve[i].posy + "px";

    if (
      nieve[i].posy >= marginbottom - 2 * parseInt(nieve[i].style.fontSize) ||
      parseInt(nieve[i].style.left) > marginright - 3 * lftrght[i]
    ) {
      if (nieve_zona == 1) {
        nieve[i].posx = aleatorio(
          marginright - parseInt(nieve[i].style.fontSize)
        );
      } else if (nieve_zona == 2) {
        nieve[i].posx = aleatorio(
          marginright / 2 - parseInt(nieve[i].style.fontSize)
        );
      } else if (nieve_zona == 3) {
        nieve[i].posx =
          aleatorio(marginright / 2 - parseInt(nieve[i].style.fontSize)) +
          marginright / 4;
      } else if (nieve_zona == 4) {
        nieve[i].posx =
          aleatorio(marginright / 2 - parseInt(nieve[i].style.fontSize)) +
          marginright / 2;
      }

      nieve[i].posy = 0;
    }
  }

  setTimeout(movenieve, 50);
}

if (browserok) {
  window.onload = initnieve;
}
