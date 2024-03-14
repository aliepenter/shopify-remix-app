class DiscountBlock extends HTMLElement {
    constructor() {
        super();
        this.init();
    }
    init() {
        this.querySelector('button').addEventListener('click', this.onClick.bind(this), false);
        const localStorageDiscount = localStorage.getItem('dmp_discout-code');
        if (localStorageDiscount) {
            const storedData = JSON.parse(localStorageDiscount);
            const data = this.requestServer(storedData);
            this.handleAfterRequestServer(data);
        }
    }
    handleAfterRequestServer(data) {
        const _this = this;
        data
            .then((val) => {
                switch (val.data.discount_detail.type) {
                    case 'shipping_line':
                        _this.handleCookie(val.data.discount_detail.title);
                        _this.renderTag(val.data.discount_detail.title, _this);
                        _this.renderDiscountInformation(val.data.discount_detail, _this);
                        break;
                    default:
                        _this.handleCookie(val.data.discount_detail.title);
                        _this.renderTag(val.data.discount_detail.title, _this);
                        _this.renderDiscountInformation(val.data.discount_detail, _this);
                        break;
                }
            })
            .catch((error) => {
                _this.renderError(error);
            })
            .finally(() => {
                _this.clearDiscount();
            });
    }
    onClick(e) {
        e.preventDefault();
        this.clearHtml();
        const data = this.requestServer();
        this.handleAfterRequestServer(data);
    }
    handleCookie(code) {
        document.cookie = `discount_code=${code}; expires=Session; path=/`;
    }
    handleLocalstorage(data) {
        const stringifyData = JSON.stringify(data);
        localStorage.setItem('dmp_discout-code', stringifyData);
    }
    clearCookie(code) {
        fetch('/checkout?discount=CLEAR');
        document.cookie = `discount_code=${code}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
        localStorage.removeItem("dmp_discout-code");
    }
    requestServer(localStorageDiscount) {
        const _this = this;
        let data = {};
        if (localStorageDiscount) {
            data = localStorageDiscount;
        } else {
            data = {
                cart: {
                    items: JSON.parse(this.querySelector('.bsCartItems').textContent),
                },
                discount_code: this.querySelector('input').value,
                currency: this.dataset.currency,
            };
        }
        return new Promise((resolve, reject) => {
            fetch('https://hayshirt263.myshopify.com/apps/discount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .then((response) => {
                    if (response.data.statusCode === 404) {
                        // check invalid code
                        reject(response.data.message);
                    } else {
                        resolve(response);
                        _this.handleLocalstorage(data);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }
    clearHtml() {
        const allExternalDivs = this.querySelectorAll("div");
        allExternalDivs.forEach(div => {
            if (!div.classList.contains('dmp_discount-form')) {
                div.remove();
            }
        });
    }
    renderDiscountInformation(discount_detail, d) {
        const informationParentDiv = document.createElement("DIV");
        informationParentDiv.classList.add("dmp_discount-information");
        if (discount_detail.type === "shipping_line") {
            const discountFSContentHtml = `
            <div class="dmp_discount-freeship">
                <span class="dmp_discount-title">Discount:</span>
                <span class="dmp_discount-content">Free Shipping</span>
            </div>
        `
            informationParentDiv.innerHTML += discountFSContentHtml,
                d.appendChild(informationParentDiv);
        } else {
            const discountPrice = this.formatPrice(discount_detail.discount_amount),
                totalPrice = this.formatPrice(discount_detail.total);

            const discountContentHtml = `
            <div class="dmp_discount-savings">
                <span class="dmp_discount-title">Discount:</span>
                <span class="dmp_discount-content">-${discountPrice}${discount_detail.currency}</span>
            </div>
            <div class="dmp_total-information">
                <span class="dmp_total-title">Total:</span>
                <span class="dmp_total-content">${totalPrice}${discount_detail.currency}</span>
            </div>
        `
            informationParentDiv.innerHTML += discountContentHtml,
                d.appendChild(informationParentDiv);
        }
    }
    formatPrice(number) {
        return number.toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    }
    renderTag(tagName, d) {
        const tagParentDiv = document.createElement("DIV");
        tagParentDiv.classList.add("dmp_discount-tag");
        const tagContentHtml = `
            <div class="dmp_discount-code">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" style="width: 16px; height: 16px;">
                    <path d="M17.78 3.09C17.45 2.443 16.778 2 16 2h-5.165c-.535 0-1.046.214-1.422.593l-6.82 6.89c0 .002 0 .003-.002.003-.245.253-.413.554-.5.874L.738 8.055c-.56-.953-.24-2.178.712-2.737L9.823.425C10.284.155 10.834.08 11.35.22l4.99 1.337c.755.203 1.293.814 1.44 1.533z" fillOpacity=".55"></path>
                    <path d="M10.835 2H16c1.105 0 2 .895 2 2v5.172c0 .53-.21 1.04-.586 1.414l-6.818 6.818c-.777.778-2.036.782-2.82.01l-5.166-5.1c-.786-.775-.794-2.04-.02-2.828.002 0 .003 0 .003-.002l6.82-6.89C9.79 2.214 10.3 2 10.835 2zM13.5 8c.828 0 1.5-.672 1.5-1.5S14.328 5 13.5 5 12 5.672 12 6.5 12.672 8 13.5 8z"></path>
                </svg>
                <span class="dmp_code-title" title="${tagName.toUpperCase()}">${tagName.toUpperCase()}</span>
                <button type="button" class="dmp_code-remove-button">
                    <svg width="13" height="13" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 1.5L11.5 11.5" stroke="currentColor" stroke-linecap="round" />
                        <path d="M11.5 1.5L1.5 11.5" stroke="currentColor" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
        `
        tagParentDiv.innerHTML += tagContentHtml,
            d.appendChild(tagParentDiv);
    }
    renderError(error) {
        const errorParentDiv = document.createElement("DIV");
        errorParentDiv.classList.add("dmp_error-parent");
        const errorContentHtml = `
            <span class="dmp_error-message">${error}</span>
        `
        errorParentDiv.innerHTML += errorContentHtml,
            this.appendChild(errorParentDiv);
    }
    clearDiscount() {
        const removeDiscountButton = this.querySelectorAll("button.dmp_code-remove-button");
        removeDiscountButton.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const code = e.target.closest(".dmp_discount-code").querySelector(".dmp_code-title").getAttribute("title");
                this.clearCookie(code);
                this.clearHtml();
            })
        })
    }
}
customElements.define('discount-block', DiscountBlock);


const getAllCheckoutButtons = () => {
    const btns = document.querySelectorAll('button[name="checkout"]');
    if (btns.length !== 0) {
        return btns;
    } else {
        return null;
    }
}

const handleGenerateDiscountBlock = () => {
    const btns = getAllCheckoutButtons();
    const discountBlock = document.querySelector("discount-block");
    const discountBlockHTML = discountBlock?.outerHTML.replace("d-none", "");
    if (discountBlockHTML && btns !== null) {
        discountBlock.closest("div").remove();
        btns.forEach(e => {
            e.insertAdjacentHTML('beforebegin', discountBlockHTML)
        });
    }

}

handleGenerateDiscountBlock();