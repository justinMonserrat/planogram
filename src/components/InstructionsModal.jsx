export default function InstructionsModal({ onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal modal--wide" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h3 className="modal__title">How Planogram Maker works</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal__body instructions">
          <section className="instructions__section">
            <h4>What this is</h4>
            <p>
              Planogram Maker is a drag-and-drop tool for building candy concession rack layouts.
              Drag candies from the catalog onto peg slots or the box shelf, arrange bays, then
              preview or export your planogram as a PNG or JSON file.
            </p>
          </section>

          <section className="instructions__section">
            <h4>Getting started</h4>
            <ol>
              <li>Open <strong>Editing view</strong> (if you are in Preview) to drag candies and edit the rack.</li>
              <li>Filter the catalog by <strong>Peg</strong> or <strong>Box</strong>, then drag tiles onto the rack.</li>
              <li>Use <strong>+ Row</strong> / column controls to resize the peg grid; <strong>+ Add bay</strong> for another rack section.</li>
              <li>Switch to <strong>Preview</strong> for a clean presentation view (what the exported PNG looks like).</li>
            </ol>
          </section>

          <section className="instructions__section instructions__section--highlight">
            <h4>Saving &amp; local memory (important)</h4>
            <p>
              This app has <strong>no cloud account yet</strong>. Everything is stored in your
              browser&apos;s <strong>localStorage</strong> on this exact website address.
            </p>
            <ul>
              <li>
                <strong>Auto-save (work in progress)</strong> — your current rack is saved automatically
                a moment after each change under <code>planogram:wip</code>. Refreshing the page
                should bring it back <em>on the same URL and browser profile</em>.
              </li>
              <li>
                <strong>Named saves</strong> — click <strong>Save</strong> to store a layout you can
                reload later from the <strong>Saved layouts…</strong> dropdown. Auto-save alone is not
                a backup.
              </li>
              <li>
                <strong>Export JSON</strong> — the safest backup. Download a file you can re-import
                anytime, even on another computer or after clearing browser data.
              </li>
            </ul>
            <p className="instructions__warn">
              Your layout can disappear if you use a different URL, a different browser or Chrome profile, Incognito mode, or if Chrome is
              set to clear site data on exit. Click <strong>Save</strong> or <strong>Export JSON</strong>{' '}
              for anything you care about keeping.
            </p>
          </section>

          <section className="instructions__section">
            <h4>Default layout</h4>
            <p>
              New visitors start from a built-in default rack. Choose <strong>Default layout</strong>{' '}
              from the <strong>Load a layout…</strong> dropdown in the toolbar to reload it (this
              replaces your current unsaved work).
            </p>
          </section>

          <section className="instructions__section">
            <h4>Other tips</h4>
            <ul>
              <li><strong>Undo / Redo</strong> — toolbar buttons or Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z.</li>
              <li><strong>Custom candies</strong> — use <strong>+ Add candy</strong> in the catalog; custom entries can be deleted, built-in ones cannot.</li>
              <li><strong>Unknown candy</strong> — if a placement references a candy that no longer exists, use the ✕ button on the gray tile to remove it.</li>
            </ul>
          </section>

          <div className="modal__actions">
            <button type="button" className="btn btn--primary" onClick={onClose}>Got it</button>
          </div>
        </div>
      </div>
    </div>
  )
}
