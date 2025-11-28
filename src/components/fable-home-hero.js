import { html, LitElement } from "lit";

export class FableHomeHero extends LitElement {
  static properties = {
    data: { type: Object },
  };

  constructor() {
    super();
    this.data = {};
    this.style.display = "block";
  }

  createRenderRoot() {
    return this;
  }

  render() {
    const { eyebrow, title, description, ctas = [], stats = [] } = this.data || {};
    return html`
      <section class="home-hero">
        ${eyebrow ? html`<p class="home-hero-eyebrow">${eyebrow}</p>` : null}
        ${title ? html`<h1 class="home-hero-title">${title}</h1>` : null}
        ${description ? html`<p class="home-hero-description">${description}</p>` : null}
        <div class="home-hero-ctas">
          ${ctas.map(
            (cta) => html`
              <a
                class=${`home-hero-cta ${cta.variant === "primary" ? "is-primary" : ""}`}
                href=${cta.href || "#"}
              >
                ${cta.label}
              </a>
            `
          )}
        </div>
        <div class="home-hero-stats">
          ${stats.map(
            (stat) => html`
              <div>
                <div class="home-hero-stat-value">${stat.value}</div>
                <div class="home-hero-stat-label">${stat.label}</div>
              </div>
            `
          )}
        </div>
      </section>
    `;
  }
}

customElements.define("fable-home-hero", FableHomeHero);
