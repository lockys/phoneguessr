import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import './admin.css';

interface Phone {
  id: number;
  brand: string;
  model: string;
  imageUrl: string;
  active: boolean;
}

interface EditDraft {
  brand: string;
  model: string;
  imageUrl: string;
}

const PAGE_SIZE = 20;

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [mutating, setMutating] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{
    id: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.isAdmin) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const loadPhones = useCallback(() => {
    setGlobalLoading(true);
    fetch('/api/admin/phones')
      .then(r => r.json())
      .then(data => {
        setPhones(data.phones ?? []);
        setLoadError(null);
      })
      .catch(() =>
        setLoadError('Failed to load phones. Check your connection.'),
      )
      .finally(() => setGlobalLoading(false));
  }, []);

  useEffect(() => {
    if (authLoading || !user?.isAdmin) return;
    loadPhones();
  }, [authLoading, user, loadPhones]);

  const filtered = phones.filter(p =>
    `${p.brand} ${p.model}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (phone: Phone) => {
    setEditingId(phone.id);
    setEditDraft({
      brand: phone.brand,
      model: phone.model,
      imageUrl: phone.imageUrl,
    });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
    setEditError(null);
  };

  const handleSave = async () => {
    if (!editDraft || !editingId) return;
    setMutating(true);
    try {
      const res = await fetch(`/api/admin/phones?id=${editingId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(editDraft),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? 'Update failed');
        return;
      }
      setPhones(prev => prev.map(p => (p.id === editingId ? data.phone : p)));
      cancelEdit();
    } catch {
      setEditError('Network error — please try again.');
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (phone: Phone) => {
    if (
      !window.confirm(
        `Delete ${phone.brand} ${phone.model}? This cannot be undone.`,
      )
    )
      return;
    setMutating(true);
    try {
      const res = await fetch(`/api/admin/phones?id=${phone.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.status === 409) {
        setDeleteError({ id: phone.id, message: data.error });
        setTimeout(() => setDeleteError(null), 4000);
        return;
      }
      if (!res.ok) return;
      setPhones(prev => prev.filter(p => p.id !== phone.id));
    } catch {
      setDeleteError({
        id: phone.id,
        message: 'Network error — could not delete.',
      });
      setTimeout(() => setDeleteError(null), 4000);
    } finally {
      setMutating(false);
    }
  };

  if (authLoading || (!user?.isAdmin && !authLoading)) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Phone Catalog</h1>
          <div className="admin-subtitle">{phones.length} phones total</div>
        </div>
        <a href="/" className="admin-back-link">
          Back to game
        </a>
      </div>

      {loadError && (
        <div className="admin-error-banner">
          {loadError}
          <button type="button" className="admin-btn" onClick={loadPhones}>
            Retry
          </button>
        </div>
      )}

      <input
        className="admin-search"
        placeholder="Search by brand or model..."
        value={searchQuery}
        onChange={e => {
          setSearchQuery(e.target.value);
          setPage(1);
        }}
      />

      {globalLoading ? (
        <div className="admin-loading">Loading phones…</div>
      ) : (
        <div className="admin-table">
          <div className="admin-row admin-row-header">
            <span />
            <span>Brand</span>
            <span>Model</span>
            <span>Image URL</span>
            <span>Active</span>
            <span />
          </div>

          {paginated.map(phone => (
            <div key={phone.id}>
              {editingId === phone.id ? (
                <div className="admin-row-editing">
                  <div className="admin-edit-label">
                    Editing — {phone.brand} {phone.model}
                  </div>
                  <div className="admin-edit-fields">
                    <input
                      className="admin-input"
                      value={editDraft!.brand}
                      onChange={e =>
                        setEditDraft(d => d && { ...d, brand: e.target.value })
                      }
                      placeholder="Brand"
                    />
                    <input
                      className="admin-input"
                      value={editDraft!.model}
                      onChange={e =>
                        setEditDraft(d => d && { ...d, model: e.target.value })
                      }
                      placeholder="Model"
                    />
                    <input
                      className="admin-input"
                      value={editDraft!.imageUrl}
                      onChange={e =>
                        setEditDraft(
                          d => d && { ...d, imageUrl: e.target.value },
                        )
                      }
                      placeholder="Image URL"
                    />
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-save"
                        onClick={handleSave}
                        disabled={mutating}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={cancelEdit}
                        disabled={mutating}
                      >
                        X
                      </button>
                    </div>
                  </div>
                  {editError && (
                    <div className="admin-row-error">{editError}</div>
                  )}
                </div>
              ) : (
                <div className="admin-row">
                  {phone.imageUrl ? (
                    <img
                      src={phone.imageUrl}
                      alt=""
                      className="admin-thumb"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="admin-thumb-placeholder">IMG</div>
                  )}
                  <span>{phone.brand}</span>
                  <span>{phone.model}</span>
                  <span className="admin-cell-url" title={phone.imageUrl}>
                    {phone.imageUrl}
                  </span>
                  <span
                    className={
                      phone.active
                        ? 'admin-cell-active-yes'
                        : 'admin-cell-active-no'
                    }
                  >
                    {phone.active ? 'Yes' : 'No'}
                  </span>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => openEdit(phone)}
                      disabled={mutating}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-delete"
                      onClick={() => handleDelete(phone)}
                      disabled={mutating}
                    >
                      Del
                    </button>
                  </div>
                </div>
              )}
              {deleteError?.id === phone.id && (
                <div className="admin-row-error">{deleteError.message}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="admin-page-btn"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              type="button"
              className={`admin-page-btn${page === i + 1 ? ' admin-page-btn-active' : ''}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="admin-page-btn"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
