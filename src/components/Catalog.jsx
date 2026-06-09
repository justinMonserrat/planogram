import { useMemo, useState } from 'react'
import { CATEGORIES, PACKAGE_TYPES } from '../data/candies.js'
import { useCandies } from '../context/CandyContext.jsx'
import CatalogTile from './CatalogTile.jsx'
import AddCandyModal from './AddCandyModal.jsx'

export default function Catalog() {
  const { candies, isBuiltin, addCandy, deleteCandy } = useCandies()
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [activePkg, setActivePkg] = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return candies.filter((c) => {
      const matchesCat = activeCat === 'all' || c.category === activeCat
      const matchesPkg = activePkg === 'all' || c.packageType === activePkg
      const matchesQuery = !q || c.name.toLowerCase().includes(q)
      return matchesCat && matchesPkg && matchesQuery
    })
  }, [candies, query, activeCat, activePkg])

  return (
    <aside className="catalog">
      <div className="catalog__header">
        <h2 className="catalog__title">Candy Catalog</h2>
        <button className="btn btn--small btn--primary" onClick={() => setShowAdd(true)}>
          + Add candy
        </button>
      </div>

      <input
        className="catalog__search"
        type="search"
        placeholder="Search candies…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search candies"
      />

      <div className="catalog__filters">
        <div className="catalog__chips" role="group" aria-label="Filter by package type">
          <button
            className={`chip${activePkg === 'all' ? ' chip--active' : ''}`}
            onClick={() => setActivePkg('all')}
          >
            All
          </button>
          <button
            className={`chip${activePkg === 'peg' ? ' chip--active' : ''}`}
            onClick={() => setActivePkg('peg')}
          >
            {PACKAGE_TYPES.peg.label}
          </button>
          <button
            className={`chip${activePkg === 'box' ? ' chip--active' : ''}`}
            onClick={() => setActivePkg('box')}
          >
            {PACKAGE_TYPES.box.label}
          </button>
        </div>

        <div className="catalog__chips" role="group" aria-label="Filter by category">
          <button
            className={`chip${activeCat === 'all' ? ' chip--active' : ''}`}
            onClick={() => setActiveCat('all')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`chip${activeCat === cat.id ? ' chip--active' : ''}`}
              onClick={() => setActiveCat(cat.id)}
            >
              <span className="chip__dot" style={{ background: cat.color }} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog__count">
        {filtered.length} {filtered.length === 1 ? 'candy' : 'candies'}
      </div>

      <div className="catalog__grid">
        {filtered.map((candy) => (
          <CatalogTile
            key={candy.id}
            candy={candy}
            onDelete={isBuiltin(candy.id) ? null : () => deleteCandy(candy.id)}
          />
        ))}
        {filtered.length === 0 && <p className="catalog__empty">No candies match your filters.</p>}
      </div>

      {showAdd && <AddCandyModal onClose={() => setShowAdd(false)} onAdd={addCandy} />}
    </aside>
  )
}
