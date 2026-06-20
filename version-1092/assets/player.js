(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-start');
        var stream = shell.getAttribute('data-stream');
        var hls = null;
        var loaded = false;

        function loadStream() {
            if (!video || !stream || loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                loaded = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                loaded = true;
                return;
            }

            video.src = stream;
            loaded = true;
        }

        function startPlayback() {
            loadStream();
            shell.classList.add('is-playing');
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
