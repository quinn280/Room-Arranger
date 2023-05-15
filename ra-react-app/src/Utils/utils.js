const inchPixelRatio = 3;

export const inchToPx = (inches) => {
    inches = parseFloat(inches);
    var pixels = inches * inchPixelRatio;
    return pixels;
  }
  
  export const pxToInch = (pixels) => {
    pixels = parseFloat(pixels);
    var inches = parseFloat(pixels / inchPixelRatio);
    return inches;
  }

  export const generateUID = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  export const normalizeRotation = (rotation) => {
    var nRotation = parseFloat(rotation) % 360;
    if (nRotation < 0)
      nRotation += 360;
  
    return nRotation;
  }
  
  export function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }
  
  export const parseTransform = (transformText) => {
    const rotateRE = new RegExp('rotate\\((.*)\\)');
    const xRE = new RegExp('translate\\((.*),');
    const yRE = new RegExp('translate\\(.*, (.*?)\\)');
  
    const rotate = (transformText.match(rotateRE)) ? transformText.match(rotateRE)[1] : "0deg";
    const x = (transformText.match(xRE)) ? transformText.match(xRE)[1] : "0px";
    const y = (transformText.match(yRE)) ? transformText.match(yRE)[1] : "0px";
  
    return { rotate: rotate, x: x, y: y };
  }

  export const getZoomFitValue = (
    ivWidth,
    ivHeight,
    rWidth,
    rHeight,
    padX = 0,
    padY = 0
  ) => {
    var maxZoomX = (ivWidth - padX) / rWidth;
    var maxZoomY = (ivHeight - padY) / rHeight;
    return Math.min(maxZoomX, maxZoomY);
  };

  export function compareByDateCreated(a, b) {
    const aDate = new Date(a.createDate);
    const bDate = new Date(b.createDate);

    if (aDate > bDate)
        return -1;
    if (aDate < bDate)
        return 1;
    return 0;
}

export function compareByDateModified(a, b) {
    const aDate = new Date(a.modifiedDate);
    const bDate = new Date(b.modifiedDate);

    if (aDate > bDate)
        return -1;
    if (aDate < bDate)
        return 1;
    return 0;
}

export function compareByFileName(a, b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}

export function formatDate(dateString) {
    const today = new Date(Date.now());
    const date = new Date(dateString);

    // return time if today
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    else {
        return date.toLocaleDateString("en-US");
    }
}

