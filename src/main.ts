import Worker from './workers/fourier.worker.ts';

const worker = new Worker();

async function main() {
	const microphoneStream = await navigator.mediaDevices.getUserMedia({audio: true});
	const canvas = document.createElement('canvas');
	const canvas2 = document.createElement('canvas');
	const input = document.createElement('input');

	const red = document.createElement('input');
	const green = document.createElement('input');
	const blue = document.createElement('input');
  

	red.setAttribute('type', 'range');
	red.setAttribute('max', '255');
	red.setAttribute('min', '0');

	green.setAttribute('type', 'range');
	green.setAttribute('max', '255');
	green.setAttribute('min', '0');

	blue.setAttribute('type', 'range');
	blue.setAttribute('max', '255');
	blue.setAttribute('min', '0');


	let r = Number(red.value);
	let g = Number(green.value);
	let b = Number(blue.value);

	red.addEventListener('change', (e: any) => {
		r = Number(e.target.value);
	});

	green.addEventListener('change', (e: any) => {
		g = Number(e.target.value);
	});

	blue.addEventListener('change', (e: any) => {
		b = Number(e.target.value);
	});



	let power = 11;

	input.setAttribute('type', 'number');
	input.setAttribute('max', '15');
	input.setAttribute('min', '5');
	input.value = String(power);



	canvas.style.width = '100%';
	canvas.style.height = '300px';

	canvas2.style.width = '100%';
	canvas2.style.height = '300px';

	document.body.appendChild(canvas);
	document.body.appendChild(canvas2);
	document.body.appendChild(input);
	document.body.appendChild(red);
	document.body.appendChild(green);
	document.body.appendChild(blue);



	const audioCtx = new window.AudioContext();
	const analyser = audioCtx.createAnalyser();
	const source = audioCtx.createMediaStreamSource(microphoneStream);
	let bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);

	analyser.getByteTimeDomainData(dataArray); 
	source.connect(analyser);

	let fftSize = Math.pow(2, power);

	if (input) {
		input.addEventListener('change', (event: any) => {
			power = Number(event.target.value);
			fftSize = Math.pow(2, power);
			analyser.fftSize = fftSize;
			bufferLength = analyser.frequencyBinCount;
		});
	}

	function drawWave() {
		const canvasCtx = canvas.getContext('2d');

		if (!canvasCtx) {
			return;
		}

		const WIDTH = canvas.width;
		const HEIGHT = canvas.height;

		canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    
		const draw = () => {
			requestAnimationFrame(draw);

			analyser.getByteTimeDomainData(dataArray);
			canvasCtx.fillStyle = 'rgb(200, 200, 200)';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
			canvasCtx.beginPath();

			const sliceWidth = WIDTH * 1.0 / bufferLength;
			let x = 0;

			for(let i = 0; i < bufferLength; i++) {

				const v = dataArray[i] / 128.0;
				const y = v * HEIGHT/2;

				if(i === 0) {
					canvasCtx.moveTo(x, y);
				} else {
					canvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			canvasCtx.lineTo(canvas.width, canvas.height/2);
			canvasCtx.stroke();
		};


		draw();
	}

	function drawLines() {
		const canvasCtx = canvas2.getContext('2d');

		if (!canvasCtx) {
			return;
		}

		const WIDTH = canvas2.width;
		const HEIGHT = canvas2.height;

		canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

		function draw() {
			if (!canvasCtx) {
				return;
			}

			requestAnimationFrame(draw);

			analyser.getByteFrequencyData(dataArray);

			canvasCtx.fillStyle = 'rgb(0, 0, 0)';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
			const barWidth = (WIDTH / bufferLength) * 2.5;
			let barHeight: number;
			let x = 0;

			canvasCtx.fillStyle = 'rgb(127,127,127)';
			canvasCtx.fillRect(0, HEIGHT/2, WIDTH, 1);


			for(let i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i]/2;
				canvasCtx.fillStyle = `rgb(${Math.min(barHeight*8, r)},${Math.min(barHeight*8, g)},${Math.min(barHeight*8, b)})`;
				canvasCtx.fillRect(x,HEIGHT/2-barHeight/2,barWidth,barHeight);

				x += barWidth + 1;
			}
		}

		draw();
	}


	




	drawWave();
	drawLines();
}

main();



