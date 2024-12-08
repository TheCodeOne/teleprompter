const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { ChildProcess } = require('child_process');

const resourcesDir = path.join(__dirname, '../resources');
const svgFile = path.join(resourcesDir, 'icon.svg');
const pngFile = path.join(resourcesDir, 'icon.png');
const templateFile = path.join(resourcesDir, 'iconTemplate.png');
const templateFile2x = path.join(resourcesDir, 'iconTemplate@2x.png');
const iconset = path.join(resourcesDir, 'icon.iconset');
const destination = path.join(resourcesDir, 'icon.icns');

// Function to run a command and wait for it to complete
const runCommand = (command: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args) as typeof ChildProcess.prototype;
    proc.on('close', (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    proc.stderr?.on('data', (data: Buffer) => {
      console.error(`${command} error:`, data.toString());
    });
  });
};

async function generateIcons(): Promise<void> {
  try {
    // Convert SVG to high-quality PNG using ImageMagick with proper color handling
    console.log('Converting SVG to PNG (512x512)...');
    execSync(`magick convert -background none -density 2048 -colorspace RGB ${svgFile} -resize 512x512 -colorspace sRGB -depth 8 ${pngFile}`);
    console.log('PNG icon created successfully!');

    // Create template icons for the tray (16x16 and 32x32)
    console.log('Creating template icons for tray...');
    execSync(`magick convert -background none -density 2048 ${svgFile} -resize 16x16 -colorspace gray ${templateFile}`);
    execSync(`magick convert -background none -density 2048 ${svgFile} -resize 32x32 -colorspace gray ${templateFile2x}`);
    console.log('Template icons created successfully!');

    // Create iconset directory
    console.log('Creating iconset directory...');
    if (fs.existsSync(iconset)) {
      fs.rmSync(iconset, { recursive: true });
    }
    await runCommand('mkdir', ['-p', iconset]);

    // Generate different icon sizes for macOS
    console.log('Generating different icon sizes...');
    const sizes = [16, 32, 64, 128, 256, 512];
    for (const size of sizes) {
      const double = size * 2;
      // Normal size
      await runCommand('sips', ['-s', 'format', 'png', '--matchTo', '/System/Library/ColorSync/Profiles/sRGB Profile.icc', '-z', size.toString(), size.toString(), pngFile, '--out', path.join(iconset, `icon_${size}x${size}.png`)]);
      // Retina size
      await runCommand('sips', ['-s', 'format', 'png', '--matchTo', '/System/Library/ColorSync/Profiles/sRGB Profile.icc', '-z', double.toString(), double.toString(), pngFile, '--out', path.join(iconset, `icon_${size}x${size}@2x.png`)]);
    }

    // Convert iconset to icns
    console.log('Converting to icns...');
    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
    }
    await runCommand('iconutil', ['-c', 'icns', iconset, '-o', destination]);

    console.log('Icon generation completed successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 