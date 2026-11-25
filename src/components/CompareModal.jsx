import { MapPinIcon, StarIcon } from './Icons.jsx';

export default function CompareModal({ tours, onClose, onBookTour, onRemove }) {
  if (!tours || tours.length === 0) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="detail-modal compare-modal" role="dialog" aria-modal="true" aria-labelledby="compare-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close comparison">
          ×
        </button>
        <div className="detail-body">
          <div>
            <div className="eyebrow dark-eyebrow">SIDE-BY-SIDE COMPARISON</div>
            <h2 id="compare-title">Compare <em>journeys.</em></h2>
          </div>

          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {tours.map((t) => (
                    <th key={t.id}>
                      <div className="compare-head-card">
                        <img src={t.image} alt={t.title} />
                        <strong>{t.title}</strong>
                        <button type="button" className="compare-remove" onClick={() => onRemove(t.id)}>
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Location</td>
                  {tours.map((t) => (
                    <td key={t.id}><MapPinIcon size={11} /> {t.location}</td>
                  ))}
                </tr>
                <tr>
                  <td>Price / guest</td>
                  {tours.map((t) => (
                    <td key={t.id}><strong>₹{Number(t.price).toLocaleString('en-IN')}</strong></td>
                  ))}
                </tr>
                <tr>
                  <td>Duration</td>
                  {tours.map((t) => (
                    <td key={t.id}>{t.duration}</td>
                  ))}
                </tr>
                <tr>
                  <td>Category</td>
                  {tours.map((t) => (
                    <td key={t.id}>{t.category}</td>
                  ))}
                </tr>
                <tr>
                  <td>Pace</td>
                  {tours.map((t) => (
                    <td key={t.id}>{t.difficulty || 'Easy'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Rating</td>
                  {tours.map((t) => (
                    <td key={t.id}><span className="rating-badge"><StarIcon /> {t.rating || 4.8}</span></td>
                  ))}
                </tr>
                <tr>
                  <td>Top highlight</td>
                  {tours.map((t) => (
                    <td key={t.id}>{(t.highlights && t.highlights[0]) || t.description}</td>
                  ))}
                </tr>
                <tr>
                  <td>Action</td>
                  {tours.map((t) => (
                    <td key={t.id}>
                      <button type="button" className="button button-dark button-xs" onClick={() => onBookTour(t)}>
                        Book now ↗
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
