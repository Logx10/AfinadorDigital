<?php 
  
?>

<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="Estilos/Navbar.css" type="text/css">
      <link rel="stylesheet" href="Estilos/Painel_afinador.css" type="text/css">
      <title>Afinador Online</title>
    </head>

    <body>
        <nav>
          <h2><a href="">Afinador Online</a></h2>
          <ul>
            <li><a href="">Violão / Guitarra </a></li>
            <li><a href="">Ukulele</a></li>
            <li><a href="">Baixo</a></li>
          </ul>
        </nav>
        <!-- <section class="painel-inicial">
          <h1>Afinador de Violão / Guitarra</h1>
          <p>Clique no botão abaixo e comece a afinar seu instrumento!</p>
          <button id="start-button">Iniciar Afinador</button>
          <div id="tuning-result"></div>
        </section> -->
      
        <section class="painel-afinando">
          <div class="nota-display">
            <h1 id="nota"></h1>
          </div>

          <div class="frequenciaa">
            <h2 id="frequencia">440 Hz</h2>
          </div>

          <div class="indicador-afinacao">
          </div>

          <button class="btniniciar"id="btnIniciar">Iniciar Afinador</button>

        </section>
        <script src="Scripts/afinador.js"></script>
      </body>

    </html>