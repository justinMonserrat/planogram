import { useState } from 'react'
import { CATEGORIES, PACKAGE_TYPES } from '../data/candies.js'

const EMPTY = {
  name: '',
  category: '',
  packageType: '',
  color: '#cccccc',
  image: '',
}

export default function AddCandyModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const isValid = form.name.trim() && form.category && form.packageType && form.color

  const submit = (e) => {
    e.preventDefault()
    if (!isValid) return
    onAdd({
      name: form.name.trim(),
      category: form.category,
      packageType: form.packageType,
      color: form.color,
      image: form.image.trim(),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h3 className="modal__title">Add a candy</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <form className="modal__body" onSubmit={submit}>
          <label className="field">
            <span className="field__label">Name *</span>
            <input className="field__input" value={form.name} onChange={update('name')} autoFocus required />
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field__label">Category *</span>
              <select className="field__input" value={form.category} onChange={update('category')} required>
                <option value="" disabled>Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Package *</span>
              <select className="field__input" value={form.packageType} onChange={update('packageType')} required>
                <option value="" disabled>Select…</option>
                {Object.values(PACKAGE_TYPES).map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>

            <label className="field field--color">
              <span className="field__label">Color *</span>
              <input className="field__color" type="color" value={form.color} onChange={update('color')} required />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Image URL (optional)</span>
            <input
              className="field__input"
              value={form.image}
              onChange={update('image')}
              placeholder="https://… or /images/your-candy.png"
            />
          </label>

          <div className="modal__actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={!isValid}>Add candy</button>
          </div>
        </form>
      </div>
    </div>
  )
}
