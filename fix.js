const fs = require('fs');
const file = 'c:/Users/ELCOT/Desktop/Symp web/certificate.html';
let content = fs.readFileSync(file, 'utf8');

const newFunc = `        async function drawCertificate(canvas, participantName, eventName, year, regId, collegeName) {
            const W = 1414, H = 1000;
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            // 1. Load the user's Canva template
            const loadTemplate = new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = 'certificate.jpeg';
            });
            const templateImg = await loadTemplate;

            if (templateImg) {
                // Draw the template to fill the canvas
                ctx.drawImage(templateImg, 0, 0, W, H);
            } else {
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#000';
                ctx.font = '30px Arial';
                ctx.fillText('Template missing: certificate.jpeg', W/2, H/2);
            }

            // 2. Overlay the dynamic text exactly on the dotted lines
            // (These coordinates are based on the standard layout. Adjust X and Y if misaligned)
            
            ctx.textBaseline = 'alphabetic';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#C60C30'; // Emirates Red, per your theme

            // --- Participant Name ---
            ctx.font = "bold 34px 'Cinzel', serif";
            ctx.fillText(participantName, W / 2 + 50, 515);

            // --- Year ---
            ctx.font = "bold 26px 'Cinzel', serif";
            ctx.fillText(year, W - 320, 515);

            // --- College Name ---
            if (collegeName) {
                ctx.font = "bold 24px 'Cinzel', serif";
                ctx.fillText(collegeName, W / 2 + 80, 570, 800);
            }

            // --- Event Name ---
            ctx.font = "bold 28px 'Cinzel', serif";
            ctx.fillText(eventName, W / 2 + 100, 625, 600);
        }`;

// Find the start and end indices
const startIndex = content.indexOf('async function drawCertificate');
if (startIndex === -1) {
    console.error('Could not find start of drawCertificate');
    process.exit(1);
}

const endIndexStr = 'function drawCornerOrnament';
const endIndex = content.indexOf(endIndexStr, startIndex);
if (endIndex === -1) {
    console.error('Could not find end of drawCertificate');
    process.exit(1);
}

// Reconstruct file
const before = content.substring(0, startIndex);
const after = content.substring(endIndex);
const newContent = before + newFunc + '\n\n        ' + after;

fs.writeFileSync(file, newContent);
console.log('Update Complete.');
