(function () {
  function setupGallery(container) {
    const grid = container.querySelector('[data-gallery-grid]');
    const fileInput = container.querySelector('[data-gallery-input]');
    const addButtons = container.querySelectorAll('[data-add-btn]');
    const removeButton = container.querySelector('[data-remove-btn]');
    const hiddenField = container.querySelector('[data-gallery-field]');
    const modal = document.querySelector('[data-gallery-modal]');
    const modalGallery = modal?.querySelector('[data-modal-gallery]');
    const modalClosers = modal
      ? modal.querySelectorAll('[data-gallery-modal-close], [data-modal-close]')
      : [];

    const items = (() => {
      try {
        const encoded = container.dataset.initialImages || '';
        const parsed = encoded ? JSON.parse(decodeURIComponent(encoded)) : [];
        return Array.isArray(parsed)
          ? parsed.map((src) => ({ src, type: 'existing' }))
          : [];
      } catch (err) {
        return [];
      }
    })();

    function syncField() {
      if (hiddenField) {
        hiddenField.value = JSON.stringify(items.map((item) => item.src));
      }
    }

    function rebuildFileInput() {
      if (!fileInput || typeof DataTransfer === 'undefined') return;

      const dt = new DataTransfer();
      items
        .filter((item) => item.type === 'file' && item.file)
        .forEach((item) => dt.items.add(item.file));

      fileInput.files = dt.files;
    }

    function renderGrid() {
      grid.innerHTML = '';
      grid.classList.remove('count-1', 'count-2', 'count-3', 'count-4', 'is-empty');

      if (!items.length) {
        grid.classList.add('is-empty');
        grid.innerHTML = `<div class="gallery-empty"><i class="fa-regular fa-image"></i><p>Drop up to four heroic portraits.</p></div>`;
        syncField();
        toggleActions();
        return;
      }

      const displayImages = items.slice(0, 4);
      grid.classList.add(`count-${displayImages.length}`);

      displayImages.forEach((item, index) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('hero-portrait-cell');

        if (displayImages.length === 1) wrapper.classList.add('one-img');
        if (displayImages.length === 2) wrapper.classList.add('two-img');
        if (displayImages.length === 3) {
          wrapper.classList.add(index < 2 ? 'three-img-top' : 'three-img-bottom');
        }
        if (displayImages.length === 4) wrapper.classList.add('four-img');

        const image = document.createElement('img');
        image.src = item.src;
        image.alt = 'Uploaded character portrait';
        image.classList.add('gallery-image');
        wrapper.appendChild(image);
        grid.appendChild(wrapper);
      });

      syncField();
      rebuildFileInput();
      toggleActions();
    }

    function toggleActions() {
      const hasImages = items.length > 0;
      if (removeButton) {
        removeButton.disabled = !hasImages;
        removeButton.setAttribute('aria-disabled', (!hasImages).toString());
      }
    }

    function handleFiles(fileList) {
      Array.from(fileList || []).forEach((file) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          items.push({ src: e.target?.result, type: 'file', file });
          renderGrid();
        };
        reader.readAsDataURL(file);
      });
      if (fileInput) fileInput.value = '';
    }

    function openModal() {
      if (!modal || !modalGallery) return;
      if (!items.length) {
        closeModal();
        return;
      }

      modalGallery.innerHTML = '';
      items.forEach((item, index) => {
        const tile = document.createElement('div');
        tile.classList.add('modal-thumb');

        const image = document.createElement('img');
        image.src = item.src;
        image.alt = `Uploaded image ${index + 1}`;

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.classList.add('btn-ghost');
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          items.splice(index, 1);
          renderGrid();
          openModal();
        });

        tile.appendChild(image);
        tile.appendChild(remove);
        modalGallery.appendChild(tile);
      });

      modal.hidden = false;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }

    function closeModal() {
      if (!modal) return;
      modal.hidden = true;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    addButtons.forEach((btn) =>
      btn.addEventListener('click', () => fileInput && fileInput.click())
    );

    if (fileInput) {
      fileInput.addEventListener('change', (event) => handleFiles(event.target.files));
    }

    if (removeButton) {
      removeButton.addEventListener('click', () => {
        if (removeButton.disabled) return;
        openModal();
      });
    }

    modalClosers.forEach((closer) => closer.addEventListener('click', closeModal));
    if (modal) {
      // Ensure the modal stays hidden on load even if server-rendered state differs
      closeModal();

      modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
      });
      if (!modal.dataset.escapeBound) {
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
          }
        });
        modal.dataset.escapeBound = 'true';
      }
    }

    renderGrid();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-gallery]').forEach(setupGallery);
  });
})();