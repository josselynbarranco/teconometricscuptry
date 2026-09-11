/* =========================================================
   TEC·ONOMETRICS CUP
   Todo lo interactivo vive en este archivo:
   - formulario
   - menú móvil
   - animación del hero
   - reveal al hacer scroll
   ========================================================= */


/* =========================================================
   FORMULARIO
   ========================================================= */

/*
  PEGA AQUÍ LA LIGA DE TU FORMULARIO.

  Ejemplo:
  const FORM_URL = "https://forms.gle/XXXXXXXXXXXX";
*/

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeY9vbHasrVQqUBoJA_uEjhfF9vkbVH-ZE7U7h2Jj2Y_6NLRw/viewform?usp=dialog";


function initForm(){

  const formLink = document.getElementById("formLink");

  if(!formLink) return;

  if(FORM_URL.trim() !== ""){

    formLink.href = FORM_URL;
    formLink.target = "_blank";
    formLink.rel = "noopener";

  }else{

    formLink.addEventListener("click", function(event){

      event.preventDefault();

      alert(
        "Las inscripciones estarán disponibles próximamente."
      );

    });

  }

}


/* =========================================================
   MENÚ MÓVIL
   ========================================================= */

function initMobileMenu(){

  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  if(!toggle || !links) return;


  toggle.addEventListener("click", function(){

    const open = links.classList.toggle("open");

    toggle.setAttribute(
      "aria-expanded",
      open ? "true" : "false"
    );

  });


  links.querySelectorAll("a").forEach(function(link){

    link.addEventListener("click", function(){

      links.classList.remove("open");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

    });

  });

}


/* =========================================================
   ANIMACIÓN HERO → "EL RETO"
   ========================================================= */

function initHeroAnimation(){

  if(!("IntersectionObserver" in window)) return;


  const heroArt =
    document.querySelector(".hero-art");

  const retoSection =
    document.getElementById("reto");

  const targetLine =
    document.getElementById("retoTransferLine");


  if(!heroArt || !retoSection || !targetLine) return;


  let transferRunning = false;
  let transferDone = false;



  /* ---------- Crear partículas ---------- */

  function createParticle(
    x,
    y,
    size,
    color,
    borderColor
  ){

    const particle =
      document.createElement("span");


    particle.className =
      "transfer-particle";


    particle.style.left =
      (x - size / 2) + "px";

    particle.style.top =
      (y - size / 2) + "px";

    particle.style.width =
      size + "px";

    particle.style.height =
      size + "px";

    particle.style.background =
      color || "transparent";


    if(borderColor){

      particle.style.border =
        "2px solid " + borderColor;

    }


    document.body.appendChild(
      particle
    );


    return particle;

  }



  /* ---------- Centro de cada punto ---------- */

  function getCircleCenter(element){

    const rect =
      element.getBoundingClientRect();


    return {

      x:
        rect.left +
        rect.width / 2,

      y:
        rect.top +
        rect.height / 2,

      size:
        Math.max(
          5,
          Math.min(
            10,
            Math.max(
              rect.width,
              rect.height
            )
          )
        )

    };

  }



  /* ---------- Obtener puntos de una línea SVG ---------- */

  function samplePathPoints(
    path,
    count
  ){

    const points = [];


    if(
      !path ||
      typeof path.getTotalLength !== "function"
    ){

      return points;

    }


    const length =
      path.getTotalLength();

    const svg =
      path.ownerSVGElement;

    const matrix =
      path.getScreenCTM();


    if(!svg || !matrix){

      return points;

    }


    for(
      let i = 0;
      i < count;
      i++
    ){

      const point =
        path.getPointAtLength(
          length *
          ((i + 1) /
          (count + 1))
        );


      const svgPoint =
        svg.createSVGPoint();


      svgPoint.x =
        point.x;

      svgPoint.y =
        point.y;


      const screenPoint =
        svgPoint.matrixTransform(
          matrix
        );


      points.push({

        x:
          screenPoint.x,

        y:
          screenPoint.y

      });

    }


    return points;

  }



  /* ---------- Limpiar partículas ---------- */

  function clearTransferNodes(){

    document.querySelectorAll(
      ".transfer-particle," +
      ".transfer-arrow," +
      ".transfer-line-piece"
    )
    .forEach(function(node){

      node.remove();

    });

  }



  /* ---------- Reiniciar animación ---------- */

  function resetTransfer(){

    clearTransferNodes();


    transferRunning =
      false;

    transferDone =
      false;


    heroArt.classList.remove(
      "graph-empty"
    );


    targetLine.classList.remove(
      "active"
    );

  }



  /* =========================================================
     ANIMACIÓN PRINCIPAL
     ========================================================= */

  function runTransfer(){

    if(
      transferRunning ||
      transferDone
    ){

      return;

    }


    transferRunning =
      true;



    /* ---------- Accesibilidad ---------- */

    const reduceMotion =

      window.matchMedia &&

      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    if(reduceMotion){

      heroArt.classList.add(
        "graph-empty"
      );

      targetLine.classList.add(
        "active"
      );


      transferRunning =
        false;

      transferDone =
        true;


      return;

    }



    /* ---------- Destino ---------- */

    const target =
      targetLine.getBoundingClientRect();


    if(target.width < 10){

      transferRunning =
        false;

      return;

    }


    const targetY =
      target.top +
      target.height / 2;


    const startX =
      target.left + 12;


    const usableWidth =
      Math.max(
        80,
        target.width - 24
      );



    /* =========================================================
       PUNTOS DEL GRÁFICO
       ========================================================= */

    const sourceDots =
      Array.from(
        heroArt.querySelectorAll(
          ".pt"
        )
      );


    const particles = [];


    sourceDots.forEach(
      function(dot){

        const center =
          getCircleCenter(dot);


        const fill =
          dot.getAttribute("fill");


        const stroke =
          dot.getAttribute("stroke");


        const isOutlined =

          fill === "none" ||

          (
            stroke &&
            stroke.toLowerCase() !==
            "none"
          );


        const color =
          isOutlined
            ? "transparent"
            : (
                fill ||
                "#e6e2d6"
              );


        const border =
          isOutlined
            ? (
                stroke ||
                "#B6F03C"
              )
            : null;


        const node =
          createParticle(

            center.x,

            center.y,

            Math.max(
              5,
              center.size * .8
            ),

            color,

            border

          );


        particles.push({

          node:
            node,

          x:
            center.x,

          y:
            center.y

        });

      }
    );



    /* =========================================================
       PREDICCIÓN PUNTEADA
       ========================================================= */

    const predPath =
      heroArt.querySelector(
        ".pred"
      );


    samplePathPoints(
      predPath,
      7
    )
    .forEach(function(point){

      const node =
        createParticle(

          point.x,

          point.y,

          5,

          "#B6F03C",

          null

        );


      particles.push({

        node:
          node,

        x:
          point.x,

        y:
          point.y

      });

    });



    /* =========================================================
       RECTA DE REGRESIÓN
       ========================================================= */

    const reg =
      heroArt.querySelector(
        ".reg-line"
      );


    const regRect =
      reg
        ? reg.getBoundingClientRect()
        : null;


    let movingLine =
      null;


    if(regRect){

      movingLine =
        document.createElement(
          "span"
        );


      movingLine.className =
        "transfer-line-piece";


      const lineWidth =
        Math.max(

          90,

          Math.hypot(
            regRect.width,
            regRect.height
          )

        );


      movingLine.style.width =
        lineWidth + "px";


      movingLine.style.left =

        (
          regRect.left +
          regRect.width / 2 -
          lineWidth / 2
        ) + "px";


      movingLine.style.top =

        (
          regRect.top +
          regRect.height / 2 -
          2.5
        ) + "px";


      movingLine.style.transform =
        "rotate(-45deg)";


      document.body.appendChild(
        movingLine
      );

    }



    /* =========================================================
       FLECHA
       ========================================================= */

    const arrow =
      heroArt.querySelector(
        ".arrow"
      );


    const arrowRect =
      arrow
        ? arrow.getBoundingClientRect()
        : null;


    let flyingArrow =
      null;


    if(arrowRect){

      flyingArrow =
        document.createElement(
          "span"
        );


      flyingArrow.className =
        "transfer-arrow";


      flyingArrow.style.left =

        (
          arrowRect.left +
          arrowRect.width / 2 -
          11
        ) + "px";


      flyingArrow.style.top =

        (
          arrowRect.top +
          arrowRect.height / 2 -
          11
        ) + "px";


      flyingArrow.style.transform =
        "rotate(-45deg)";


      document.body.appendChild(
        flyingArrow
      );

    }



    /* ---------- Vaciar gráfico original ---------- */

    window.setTimeout(
      function(){

        heroArt.classList.add(
          "graph-empty"
        );

      },
      110
    );



    /* =========================================================
       MOVIMIENTO DE LOS PUNTOS
       ========================================================= */

    particles.forEach(
      function(
        item,
        index
      ){

        const fraction =

          particles.length > 1

            ? index /
              (
                particles.length -
                1
              )

            : .5;


        const endX =

          startX +
          usableWidth *
          fraction;


        const endY =
          targetY;


        /*
          Pequeño arco hacia arriba:
          da sensación de que los puntos
          "despegan".
        */

        const lift =

          -55 -
          (index % 4) * 8;



        item.node.animate(

          [

            {

              transform:
                "translate(0,0) scale(1)",

              opacity:
                1,

              offset:
                0

            },


            {

              transform:

                "translate(" +

                (
                  (endX - item.x) *
                  .42
                ) +

                "px," +

                (
                  (endY - item.y) *
                  .42 +
                  lift
                ) +

                "px) scale(.85)",


              opacity:
                .95,


              offset:
                .48

            },


            {

              transform:

                "translate(" +

                (
                  endX -
                  item.x
                ) +

                "px," +

                (
                  endY -
                  item.y
                ) +

                "px) scale(.45)",


              opacity:
                .08,


              offset:
                1

            }

          ],


          {

            duration:
              820,

            delay:
              index * 15,

            easing:
              "cubic-bezier(.22,.8,.22,1)",

            fill:
              "forwards"

          }

        );

      }
    );



    /* =========================================================
       MOVIMIENTO DE LA FLECHA
       ========================================================= */

    if(flyingArrow){

      const arrowBox =
        flyingArrow.getBoundingClientRect();


      const arrowEndX =
        target.right - 8;


      const arrowEndY =
        targetY;


      flyingArrow.animate(

        [

          {

            transform:
              "translate(0,0) rotate(-45deg) scale(1)",

            opacity:
              1

          },


          {

            transform:

              "translate(" +

              (
                (
                  arrowEndX -
                  (
                    arrowBox.left +
                    arrowBox.width / 2
                  )
                ) *
                .45
              ) +

              "px," +

              (
                (
                  arrowEndY -
                  (
                    arrowBox.top +
                    arrowBox.height / 2
                  )
                ) *
                .45 -
                75
              ) +

              "px) rotate(-45deg) scale(.9)",


            opacity:
              1,


            offset:
              .5

          },


          {

            transform:

              "translate(" +

              (
                arrowEndX -
                (
                  arrowBox.left +
                  arrowBox.width / 2
                )
              ) +

              "px," +

              (
                arrowEndY -
                (
                  arrowBox.top +
                  arrowBox.height / 2
                )
              ) +

              "px) rotate(45deg) scale(.55)",


            opacity:
              0

          }

        ],


        {

          duration:
            900,

          easing:
            "cubic-bezier(.22,.8,.22,1)",

          fill:
            "forwards"

        }

      );

    }



    /* =========================================================
       MOVIMIENTO DE LA RECTA
       ========================================================= */

    if(movingLine){

      const movingLineBox =
        movingLine.getBoundingClientRect();


      const lineTargetX =
        target.left +
        target.width / 2;


      const lineTargetY =
        targetY;


      movingLine.animate(

        [

          {

            transform:
              "translate(0,0) rotate(-45deg) scaleX(1)",

            opacity:
              1

          },


          {

            transform:

              "translate(" +

              (
                (
                  lineTargetX -
                  (
                    movingLineBox.left +
                    movingLineBox.width / 2
                  )
                ) *
                .45
              ) +

              "px," +

              (
                (
                  lineTargetY -
                  (
                    movingLineBox.top +
                    movingLineBox.height / 2
                  )
                ) *
                .45 -
                45
              ) +

              "px) rotate(-20deg) scaleX(.85)",


            opacity:
              1,


            offset:
              .5

          },


          {

            transform:

              "translate(" +

              (
                lineTargetX -
                (
                  movingLineBox.left +
                  movingLineBox.width / 2
                )
              ) +

              "px," +

              (
                lineTargetY -
                (
                  movingLineBox.top +
                  movingLineBox.height / 2
                )
              ) +

              "px) rotate(0deg) scaleX(" +

              Math.max(

                .6,

                target.width /
                Math.max(
                  1,
                  movingLineBox.width
                )

              ) +

              ")",


            opacity:
              .95

          }

        ],


        {

          duration:
            900,

          easing:
            "cubic-bezier(.22,.8,.22,1)",

          fill:
            "forwards"

        }

      );

    }



    /* ---------- Aparece la línea verde ---------- */

    window.setTimeout(
      function(){

        targetLine.classList.add(
          "active"
        );

      },
      760
    );



    /* ---------- Limpiar elementos flotantes ---------- */

    window.setTimeout(
      function(){

        clearTransferNodes();

        transferRunning =
          false;

        transferDone =
          true;

      },
      1120
    );

  }



  /* =========================================================
     OBSERVADOR DEL RETO
     ========================================================= */

  const transferObserver =
    new IntersectionObserver(

      function(entries){

        entries.forEach(
          function(entry){

            if(
              entry.isIntersecting &&
              window.scrollY > 40
            ){

              runTransfer();

            }

          }
        );

      },

      {

        threshold:
          .28

      }

    );


  transferObserver.observe(
    retoSection
  );



  /* ---------- Restaurar al volver al inicio ---------- */

  window.addEventListener(

    "scroll",

    function(){

      if(
        window.scrollY < 70 &&
        (
          transferDone ||
          transferRunning
        )
      ){

        resetTransfer();

      }

    },

    {

      passive:
        true

    }

  );

}


/* =========================================================
   REVEAL AL HACER SCROLL
   ========================================================= */

function initReveal(){

  if(!("IntersectionObserver" in window)) return;


  const observer =
    new IntersectionObserver(

      function(entries){

        entries.forEach(
          function(entry){

            if(
              entry.isIntersecting
            ){

              entry.target.classList.add(
                "animate"
              );


              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },

      {

        threshold:
          .15

      }

    );


  document
    .querySelectorAll(".reveal")
    .forEach(
      function(element){

        observer.observe(
          element
        );

      }
    );

}


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    initForm();

    initMobileMenu();

    initHeroAnimation();

    initReveal();

  }
);
