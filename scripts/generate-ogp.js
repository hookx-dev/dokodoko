const sharp = require('sharp');
const fs = require('fs');

async function createOgp() {
  try {
    const width = 1200;
    const height = 630;

    // 1. 白背景キャンバスを作成
    const background = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 248, g: 250, b: 252, alpha: 1 } // slate-50
      }
    });

    // 2. ロゴの読み込みとリサイズ (枠に収めて透過パディング)
    const logoBuffer = fs.readFileSync('public/logo_full.png');
    const logo = await sharp(logoBuffer)
      .resize({
        width: 800,
        height: 200,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // 3. テキスト用のSVGレイヤーを作成
    const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .title { 
            fill: #334155; 
            font-size: 38px; 
            font-weight: 600; 
            font-family: sans-serif;
            letter-spacing: 2px;
          }
        </style>
        <text x="50%" y="450" text-anchor="middle" class="title">
          カップルや友達と、思い出の場所を共有しよう
        </text>
      </svg>
    `;

    // 4. 重ね合わせ (座標を直接指定)
    await background
      .composite([
        { input: logo, left: 200, top: 170 }, 
        { input: Buffer.from(svgText), left: 0, top: 0 }
      ])
      .jpeg({ quality: 90 })
      .toFile('public/ogp.jpg');
      
    console.log('OGP image with text generated successfully!');
  } catch (error) {
    console.error('Error generating OGP:', error);
  }
}

createOgp();
