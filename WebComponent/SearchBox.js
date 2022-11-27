class SearchBox extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    // 模板
    this.template = document.createElement("template");
    this.template.innerHTML = `
    <div class="wrapper">
        <slot name="left">
            <img src="./icons/search.svg" alt="" />
        </slot>
        <input placeholder="please input" type="text" id="input" />
        <slot name="right">
            <img src="./icons/x.svg" alt="" />
        </slot> 
    </div>
    `;

    // 样式
    this.styles = document.createElement("style");
    this.styles.innerHTML = `
    /* 阳光DOM中的样式 */
    :host([focused]){
        box-shadow: 0 0 12px #6ea;
    }
    :host([disabled]){
        opacity: .5;
    }
    :host([hidden]){
        display: none;
    }

    /* 影子DOM中的样式 */
    .wrapper {
        border: 2px solid #191919;
        display: flex;
        align-items: center;
        border-radius: 5px;
        padding: 0 10px;
      }
      
    .wrapper input {
        border: none;
        outline: none;
        background: transparent;
        padding: 10px;
        width: 50vw;
        font-family: Lora;
    }
    `;
  }

  static get observedAttributes() {
    return ["disabled", "placeholder", "size", "value"];
  }

  connectedCallback() {
    this.shadowRoot.append(
      document.importNode(this.template.content, true),
      this.styles
    );
    this.input = this.shadowRoot.querySelector("#input");
    this.leftSlot = this.shadowRoot.querySelector("slot[name='left']");
    this.rightSlot = this.shadowRoot.querySelector("slot[name='right']");

    this.input.addEventListener("focus", () =>
      this.setAttribute("focused", "")
    );
    this.input.addEventListener("blur", () => this.removeAttribute("focused"));

    this.rightSlot.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.hasAttribute("disabled")) return;
      this.dispatchEvent(new CustomEvent("clear", { cancelable: true }));
      if (!e.defaultPrevented) this.input.value = "";
    });

    this.leftSlot.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.hasAttribute("disabled")) return;
      this.dispatchEvent(
        new CustomEvent("search", {
          detail: this.input.value,
        })
      );
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case "disabled":
        this.input && (this.input.disabled = !!newVal);
        break;
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  get hidden() {
    return this.hasAttribute("hidden");
  }
}

customElements.define("search-box", SearchBox);
