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

    // 2. ロゴの読み込みとリサイズ
    const logoBuffer = fs.readFileSync('public/logo_full.png');
    // 高さを200pxにして、下部にテキスト用のスペースを確保
    const logo = await sharp(logoBuffer)
      .resize({
        width: 800,
        height: 200,
        fit: 'inside',
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
        <text x="50%" y="460" text-anchor="middle" class="title">
          カップルや友達と、思い出の場所を共有しよう
        </text>
      </svg>
    `;

    // 4. 重ね合わせ (ロゴを中心より少し上に配置し、テキストを下に配置)
    await background
      .composite([
        // ロゴのY座標: 中央(315) - (200/2) - 40(少し上へ) = 175 くらい
        { input: logo, gravity: 'north', top: 180 }, 
        { input: Buffer.from(svgText), top: 0, left: 0 }
      ])
      .jpeg({ quality: 90 })
      .toFile('public/ogp.jpg');
      
    console.log('OGP image with text generated successfully!');
  } catch (error) {
    console.error('Error generating OGP:', error);
  }
}

createOgp();
