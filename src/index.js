import { btcPathData, satPathData } from './consts.js';

const btcMul = 100000000;


const createSvgElement = (pathData, color = "#f7931a", width = 16) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg',"svg");
    svg.setAttributeNS(null, "fill", color);
    svg.setAttributeNS(null, "width", width);
    svg.setAttributeNS(null, "viewBox", "0 0 24 24");
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg',"path");
    svgPath.setAttributeNS(null, "d", pathData);
    svgPath.setAttributeNS(null, "fill-rule", "evenodd");
    svg.appendChild(svgPath);
    return svg;
}


class BitcoinFormatter {
    value_sat = 0;

    constructor(opts) {
        this.value_sat = opts.btc ? opts.btc * btcMul : opts.sat | 0;
        this.onAmountChange = opts.onAmountChange;
        this.root = document.createElement('div');
        this.root.className = 'bitcoin-format';
    }

    fadeDigits = () => {
        const digits = this.root.querySelectorAll('[data-index]');
        let isZero = true;
        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits[i].innerHTML);
            if (digit === 0 && isZero) {
                digits[i].classList.add('zero');
            } else {
                digits[i].classList.remove('zero');
                isZero = false;
            }
        }
    }

    getAmount = () => {
        const digits = this.root.querySelectorAll('[data-index]');
        let amount = 0;
        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits[i].innerHTML);
            amount += digit * Math.pow(10, digits.length - i - 1);
        }
        return amount;
    }

    selectElementContents = (el) => {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    onClick = (e) => {
        this.selectElementContents(e.currentTarget);
    }

    onKeydown = (e) => {
        const isNumberPressed = (e.keyCode >= 48 && e.keyCode <= 57)
            || (e.keyCode >= 96 && e.keyCode <= 105);

        if (!isNumberPressed) { // not a number
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
            return;
        }
        e.currentTarget.innerHTML = '';
    };

    onKeyup = (evt) => {
        const theEvent = evt || window.event;
        let keycode = theEvent.keyCode || theEvent.which;
        const currentIndex = parseInt(evt.currentTarget.dataset.index);
        let nextIndex = currentIndex + 1;
        // left arrow
        if (keycode === 37) {
            nextIndex = currentIndex - 1;
        }
        // backspace
        if (keycode === 8) {
            nextIndex = currentIndex - 1;
            evt.currentTarget.innerHTML = 0;
        }
        // delete
        if (keycode === 46) {
            evt.currentTarget.innerHTML = 0;
        }

        if (this.onAmountChange !== undefined) {
            this.onAmountChange(this.getAmount());
        }


        const next = this.root.querySelector(`[data-index="${nextIndex}"]`)
        if (next) {
            next.focus()
            this.selectElementContents(next)
        } else {
            this.selectElementContents(evt.currentTarget)
        }

        this.fadeDigits();

    };

    render() {

        const el = document.createElement('div');

        const btcSvg = createSvgElement(btcPathData);
        el.appendChild(btcSvg);

        const span_btc = document.createElement('span')
        span_btc.innerHTML = '0'
        span_btc.className = 'faded'
        el.appendChild(span_btc);

        const span_period = document.createElement('span')
        span_period.innerHTML = '.'
        span_period.className = 'faded'
        el.appendChild(span_period);

        const digits = this.value_sat.toString().padStart(8, '0').split('');
        for (let i = 0; i < digits.length; i++) {
            let span = document.createElement('span')
            span.contentEditable = true
            span.innerHTML = digits[i]
            span.dataset.index = i
            if ([1, 4].indexOf(i) > -1) {
                span.style.marginRight = '0.3em'
            }
            span.addEventListener('click', this.onClick)
            span.addEventListener('keydown', this.onKeydown)
            span.addEventListener('keyup', this.onKeyup)
            el.appendChild(span);
        }

        const satSvg = createSvgElement(satPathData, "#fe3");
        el.appendChild(satSvg);

        this.root.appendChild(el);

        this.fadeDigits();

        return this.root;
    }
}

export default BitcoinFormatter;
