import { LitElement, html, css } from "lit";
import { listComponentMetadata } from "@metadata";
import { getHomepageTaxonomyGroups } from "@store";

export class FablePlayroomPalette extends LitElement {
  static properties = {
    _components: { state: true },
    _filteredComponents: { state: true },
    _searchQuery: { state: true },
    _selectedGroup: { state: true },
    _taxonomyGroups: { state: true },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-background);
    }

    .palette-header {
      padding: var(--space-3);
      background: var(--color-background-secondary);
      border-bottom: 1px solid var(--border-color);
    }

    .search-input {
      width: 100%;
      padding: var(--space-2);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-2);
    }

    .group-filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
    }

    .group-chip {
      padding: var(--space-1) var(--space-2);
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-xs);
      cursor: pointer;
      transition: all 0.2s;
    }

    .group-chip.active {
      background: var(--color-primary);
      color: var(--color-primary-text);
      border-color: var(--color-primary);
    }

    .components-list {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-2);
    }

    .component-group {
      margin-bottom: var(--space-4);
    }

    .group-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .component-item {
      display: flex;
      align-items: center;
      padding: var(--space-2);
      margin-bottom: var(--space-1);
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      cursor: grab;
      transition: all 0.2s;
    }

    .component-item:hover {
      background: var(--color-background-secondary);
      border-color: var(--color-primary);
      transform: translateY(-1px);
    }

    .component-item:active {
      cursor: grabbing;
      transform: translateY(0);
    }

    .component-icon {
      width: 20px;
      height: 20px;
      margin-right: var(--space-2);
      opacity: 0.7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .component-info {
      flex: 1;
      min-width: 0;
    }

    .component-name {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text);
      margin-bottom: 2px;
    }

    .component-description {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .component-status {
      padding: 2px 6px;
      background: var(--color-background-secondary);
      border-radius: var(--border-radius-full);
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .component-status.beta {
      background: var(--color-warning-background);
      color: var(--color-warning-text);
    }

    .component-status.alpha {
      background: var(--color-error-background);
      color: var(--color-error-text);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-6);
      color: var(--color-text-secondary);
    }
  `;

  constructor() {
    super();
    this._components = [];
    this._filteredComponents = [];
    this._searchQuery = "";
    this._selectedGroup = "all";
    this._taxonomyGroups = [];
    this._loadData();
  }

  _loadData() {
    // Load component metadata
    const rawComponents = listComponentMetadata();
    this._components = rawComponents
      .filter((comp) => comp.kind === "component-story")
      .map((comp) => ({
        ...comp,
        snippet: this._generateSnippet(comp),
      }));

    // Load taxonomy groups
    this._taxonomyGroups = [{ id: "all", label: "All" }, ...getHomepageTaxonomyGroups()];

    this._filterComponents();
  }

  _generateSnippet(componentMeta) {
    const { component } = componentMeta;

    // Generate basic snippet based on component type
    const snippets = {
      "fable-button": `<fable-button variant="primary">
  Button Text
</fable-button>`,
      "fable-input": `<fable-input placeholder="Enter text" value="" />`,
      "fable-card": `<fable-card>
  <h3 slot="title">Card Title</h3>
  <p slot="body">Card content goes here</p>
</fable-card>`,
      "fable-badge": '<fable-badge tone="neutral">Badge</fable-badge>',
      "fable-checkbox": '<fable-checkbox checked={false} label="Option" />',
      "fable-textarea": '<fable-textarea placeholder="Enter text" value="" />',
      "fable-select": '<fable-select value="" options={[]} />',
      "fable-stack": `<fable-stack gap="var(--space-4)">
  <div>Content 1</div>
  <div>Content 2</div>
</fable-stack>`,
      "fable-icon-button": '<fable-icon-button icon="edit" />',
    };

    return (
      snippets[component] ||
      `<${component}>
  Content
</${component}>`
    );
  }

  _filterComponents() {
    let filtered = this._components;

    // Filter by group
    if (this._selectedGroup !== "all") {
      filtered = filtered.filter((comp) => comp.taxonomy?.group === this._selectedGroup);
    }

    // Filter by search query
    if (this._searchQuery) {
      const query = this._searchQuery.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          comp.title.toLowerCase().includes(query) ||
          comp.description?.toLowerCase().includes(query) ||
          comp.keywords?.some((keyword) => keyword.toLowerCase().includes(query)) ||
          comp.component.toLowerCase().includes(query)
      );
    }

    // Group by taxonomy
    this._filteredComponents = this._groupComponents(filtered);
  }

  _groupComponents(components) {
    const groups = {};

    components.forEach((comp) => {
      const group = comp.taxonomy?.group || "Other";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(comp);
    });

    return groups;
  }

  _handleSearch(event) {
    this._searchQuery = event.target.value;
    this._filterComponents();
  }

  _handleGroupSelect(event) {
    this._selectedGroup = event.target.dataset.group;
    this._filterComponents();
  }

  _handleComponentDragStart(event, component) {
    // Set drag data with component snippet
    event.dataTransfer.setData("text/plain", component.snippet);
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "component",
        component: component.component,
        snippet: component.snippet,
        metadata: component,
      })
    );

    // Add visual feedback
    event.target.style.opacity = "0.5";
  }

  _handleComponentDragEnd(event) {
    // Remove visual feedback
    event.target.style.opacity = "";
  }

  _handleComponentClick(component) {
    // Insert snippet at cursor position in editor
    this.dispatchEvent(
      new CustomEvent("component-insert", {
        detail: {
          snippet: component.snippet,
          component: component.component,
          metadata: component,
        },
        bubbles: true,
      })
    );
  }

  render() {
    return html`
      <div class="palette-header">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search components..."
          value=${this._searchQuery}
          @input=${this._handleSearch}
        />
        
        <div class="group-filters">
          ${this._taxonomyGroups.map(
            (group) => html`
            <button 
              class="group-chip ${this._selectedGroup === group.id ? "active" : ""}"
              data-group=${group.id}
              @click=${this._handleGroupSelect}
            >
              ${group.label}
            </button>
          `
          )}
        </div>
      </div>

      <div class="components-list">
        ${
          Object.keys(this._filteredComponents).length === 0
            ? html`
          <div class="empty-state">
            <p>No components found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        `
            : ""
        }
        
        ${Object.entries(this._filteredComponents).map(
          ([groupName, components]) => html`
          <div class="component-group">
            <h3 class="group-title">${groupName}</h3>
            
            ${components.map(
              (component) => html`
              <div 
                class="component-item"
                draggable="true"
                @dragstart=${(e) => this._handleComponentDragStart(e, component)}
                @dragend=${this._handleComponentDragEnd}
                @click=${() => this._handleComponentClick(component)}
              >
                <div class="component-icon">
                  🧩
                </div>
                
                <div class="component-info">
                  <div class="component-name">${component.title}</div>
                  <div class="component-description">${component.description}</div>
                </div>
                
                <div class="component-status ${component.taxonomy?.status || "beta"}">
                  ${component.taxonomy?.status || "beta"}
                </div>
              </div>
            `
            )}
          </div>
        `
        )}
      </div>
    `;
  }
}

customElements.define("fable-playroom-palette", FablePlayroomPalette);
