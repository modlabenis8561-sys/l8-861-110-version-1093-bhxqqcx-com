(function () {
    var video = document.querySelector('.movie-video');
    var button = document.querySelector('.player-play');
    if (!video || !button) {
        return;
    }
    var hlsInstance = null;
    function loadAndPlay() {
        var url = button.getAttribute('data-video');
        if (!url) {
            return;
        }
        button.classList.add('is-hidden');
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== url) {
                video.src = url;
            }
            video.play();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
            return;
        }
        if (video.src !== url) {
            video.src = url;
        }
        video.play();
    }
    button.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
        if (video.paused) {
            loadAndPlay();
        }
    });
})();
