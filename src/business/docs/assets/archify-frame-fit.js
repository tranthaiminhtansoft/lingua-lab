(() => {
  const fitArchifyFrames = () => {
    const frames = [...document.querySelectorAll('iframe')];

    frames.forEach((frame) => {
      if (frame.dataset.archifyFitBound) return;
      frame.dataset.archifyFitBound = 'true';
      frame.setAttribute('scrolling', 'no');
      frame.style.overflow = 'hidden';

      const fitToDocument = () => {
        const frameDocument = frame.contentDocument;
        if (!frameDocument?.body || !frameDocument.documentElement) return;

        const frameBody = frameDocument.body;
        const documentRoot = frameDocument.documentElement;
        const contentHeight = Math.max(
          frameBody.scrollHeight,
          frameBody.offsetHeight,
          documentRoot.scrollHeight,
          documentRoot.offsetHeight,
        );
        const borderHeight = frame.offsetHeight - frame.clientHeight;
        const targetHeight = Math.ceil(contentHeight + borderHeight);
        if (Math.abs(frame.offsetHeight - targetHeight) > 2) {
          frame.style.height = `${targetHeight}px`;
        }
      };

      let pendingFrame = 0;
      const scheduleFit = () => {
        if (pendingFrame) cancelAnimationFrame(pendingFrame);
        pendingFrame = requestAnimationFrame(() => {
          pendingFrame = 0;
          fitToDocument();
        });
      };

      if (window.ResizeObserver) {
        let observedWidth = frame.getBoundingClientRect().width;
        const frameWidthObserver = new ResizeObserver((entries) => {
          const nextWidth = entries[0]?.contentRect.width ?? frame.getBoundingClientRect().width;
          if (Math.abs(nextWidth - observedWidth) <= 1) return;
          observedWidth = nextWidth;
          scheduleFit();
        });
        frameWidthObserver.observe(frame);
      }

      frame.addEventListener('load', () => {
        const frameWindow = frame.contentWindow;
        frameWindow?.addEventListener('resize', scheduleFit);
        if (frameWindow?.ResizeObserver && frame.contentDocument?.body) {
          const observer = new frameWindow.ResizeObserver(scheduleFit);
          observer.observe(frame.contentDocument.documentElement);
          observer.observe(frame.contentDocument.body);
        }
        frame.contentDocument?.fonts?.ready.then(scheduleFit).catch(() => {});
        scheduleFit();
      });

      if (frame.contentDocument?.readyState === 'complete') scheduleFit();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fitArchifyFrames, { once: true });
  } else {
    fitArchifyFrames();
  }
})();
