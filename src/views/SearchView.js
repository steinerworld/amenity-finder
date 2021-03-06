import { css, html, LitElement } from 'lit-element';

import '@material/mwc-button';
import '@material/mwc-textfield';
import '@inventage/leaflet-map';
import { canGeolocate, detectUserLocation } from '../utils/geolocation.js';

export class SearchView extends LitElement {

  static get styles() {
    return css`
      :host {
        --amenity-search-form-spacing: 1rem;
  
        flex: 1;
        display: flex;
        flex-direction: column;
      }
  
      leaflet-map {
        flex: 1;
  
        /* stretch to edges */
        margin-left: calc(var(--amenity-container-padding) * -1);
        margin-right: calc(var(--amenity-container-padding) * -1);
        margin-bottom: calc(var(--amenity-container-padding) * -1);
      }
  
      .search-form {
        margin-bottom: 1rem;
      }
    `;
  }

  static get properties() {
    return {
      latitude: { type: String },
      longitude: { type: String },
      radius: { type: Number },
    };
  }


  render() {
    return html`
      <h1>Search</h1>
      <div class="search-form">
        <mwc-textfield label="Latitude" .value="${this.latitude}" @keyup="${e => (this.latitude = e.target.value)}"></mwc-textfield>
        <mwc-textfield label="Longitude" .value="${this.longitude}" @keyup="${e => (this.longitude = e.target.value)}"></mwc-textfield>
        <mwc-textfield label="Radius (m)" .value="${this.radius}" @keyup="${e => (this.radius = e.target.value)}"></mwc-textfield>
        <mwc-button outlined label="Locate Me" icon="my_location" @click="${this._handleLocateMeClick}" .disabled="${!canGeolocate()}"></mwc-button>
        <mwc-button raised label="Search" @click="${this._triggerSearch}" .disabled="${!this._canSearch()}"></mwc-button>
      </div>
      <leaflet-map
        .latitude="${this.latitude}"
        .longitude="${this.longitude}"
        .radius="${this.radius}"
        @center-updated="${this._updateLatitudeLongitudeFromMap}"
        updatecenteronclick
      ></leaflet-map>
    `;
  }
  
  _triggerSearch() {
    this.dispatchEvent(
      new CustomEvent('execute-search', {
        detail: {
          latitude: this.latitude,
          longitude: this.longitude,
          radius: this.radius,
        },
      })
    );
  }

  _canSearch() {
    return this.latitude && this.longitude && this.radius;
  }

  async _handleLocateMeClick(e) {
    e.target.blur();

    try {
      const {
        coords: { latitude, longitude },
      } = await detectUserLocation();

      this.latitude = latitude;
      this.longitude = longitude;
    } catch (err) {
      console.error(err);
    }
  }

  _updateLatitudeLongitudeFromMap(e) {
    const {
      detail: { latitude, longitude },
    } = e;

    if (!latitude || !longitude) {
      return;
    }

    this.latitude = latitude;
    this.longitude = longitude;
  }

}

customElements.define('search-view', SearchView);
