import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductFormModal from "./ProductFormModal";

const API_URL = "/api/products";
const CATEGORIES = ["Electronics", "FMCG", "Textiles"];
const UNITS = ["piece", "kg", "box", "roll", "carton", "pack"];
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [viewProduct, setViewProduct] = useState(null);
    const [role, setRole] = useState("seller");
    const [cartItems, setCartItems] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [filterCategory, setFilterCategory] = useState("All");
    const [buyerQuantities, setBuyerQuantities] = useState({});

    const [companyLogo, setCompanyLogo] = useState(() => localStorage.getItem('companyLogo') || '');
    const logoInputRef = useCallback(node => { if (node) node._ref = node; }, []);

    const handleLogoUpload = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > 2 * 1024 * 1024) { showToast('Logo must be under 2MB', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            setCompanyLogo(e.target.result);
            localStorage.setItem('companyLogo', e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // RFQ state
    const [rfqs, setRfqs] = useState([]);
    const [rfqLoading, setRfqLoading] = useState(false);
    const [showRfqPanel, setShowRfqPanel] = useState(false);
    const [respondingRfq, setRespondingRfq] = useState(null);
    const [rfqResponse, setRfqResponse] = useState({ offeredPrice: '', offeredDiscount: '', sellerNotes: '', validDays: 7 });

    // form state removed — handled by ProductFormModal

    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const user = getUser();
            const url = user.id ? `${API_URL}/business/${user.id}` : API_URL;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch {
            showToast("Cannot connect to backend. Is Spring Boot running on port 8080?", "error");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Fetch RFQs for seller
    const fetchRfqs = useCallback(async () => {
        const user = getUser();
        if (!user.id) return;
        try {
            setRfqLoading(true);
            const res = await axios.get(`/api/rfqs/seller/${user.id}`);
            setRfqs(res.data || []);
        } catch { setRfqs([]); }
        finally { setRfqLoading(false); }
    }, []);

    useEffect(() => { if (role === 'seller') fetchRfqs(); }, [role, fetchRfqs]);

    const handleRespondRfq = async (rfqId) => {
        try {
            await axios.put(`/api/rfqs/${rfqId}/respond`, {
                offeredPrice: Number(rfqResponse.offeredPrice),
                offeredDiscount: Number(rfqResponse.offeredDiscount || 0),
                sellerNotes: rfqResponse.sellerNotes,
                validDays: Number(rfqResponse.validDays || 7)
            });
            showToast('Quote sent successfully!');
            setRespondingRfq(null);
            setRfqResponse({ offeredPrice: '', offeredDiscount: '', sellerNotes: '', validDays: 7 });
            fetchRfqs();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to send quote', 'error');
        }
    };

    // CRUD Operations
    const handleFormSubmit = async (formData) => {
        try {
            const isEdit = !!editingProduct;
            const user = getUser();
            const payload = { ...formData };
            if (!isEdit && user.id) {
                payload.businessId = user.id;
            }
            const url = isEdit ? `${API_URL}/${editingProduct.id}` : API_URL;
            const method = isEdit ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast(isEdit ? "Product updated successfully!" : "Product created successfully!");
                setEditingProduct(null);
                setShowForm(false);
                fetchProducts();
            } else {
                const err = await res.json();
                showToast(err.error || `Failed to ${isEdit ? "update" : "create"} product`, "error");
            }
        } catch {
            showToast("Server connection error", "error");
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Product deleted!");
                setDeleteConfirm(null);
                fetchProducts();
            }
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const handleToggle = async (id) => {
        try {
            await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
            fetchProducts();
        } catch {
            showToast("Toggle failed", "error");
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const openCreate = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    // Cart functions
    const addToCart = (product) => {
        const qty = buyerQuantities[product.id] || product.moq;
        if (qty < product.moq) {
            showToast(`Minimum order quantity is ${product.moq}`, "error");
            return;
        }
        if (qty > (product.stock || 0)) {
            showToast(`Only ${product.stock} in stock`, "error");
            return;
        }
        const existing = cartItems.find(c => c.product.id === product.id);
        if (existing) {
            setCartItems(cartItems.map(c =>
                c.product.id === product.id ? { ...c, quantity: qty } : c
            ));
        } else {
            setCartItems([...cartItems, { product, quantity: qty }]);
        }
        showToast(`${product.name} added to cart!`);
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(c => c.product.id !== productId));
    };

    const cartTotal = cartItems.reduce((sum, item) =>
        sum + (parseFloat(item.product.basePrice) || 0) * item.quantity, 0
    );

    // Filter products
    const activeProducts = products.filter(p => p.isActive !== false);
    const filtered = (role === "buyer" ? activeProducts : products).filter(p => {
        const matchSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory === "All" || p.category === filterCategory;
        return matchSearch && matchCategory;
    });

    // Stats
    const stats = {
        total: products.length,
        active: products.filter(p => p.isActive !== false).length,
        lowStock: products.filter(p => (p.stock || 0) < 10).length,
        totalValue: products.reduce((sum, p) => sum + (parseFloat(p.basePrice) || 0) * (p.stock || 0), 0)
    };

    const getCategoryIcon = (cat) => {
        if (cat === "Electronics") return "🔌";
        if (cat === "FMCG") return "🛒";
        if (cat === "Textiles") return "🧵";
        return "📦";
    };

    // =================== RENDER ===================
    return (
        <div style={{
            minHeight: "100vh", width: "100%", background: "#0a0f1a",
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            margin: 0, padding: 0, boxSizing: "border-box"
        }}>
            <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; padding: 0; overflow-x: hidden; }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); outline: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f1a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .hover-row:hover { background: #1a2744 !important; }
        .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); border-color: #3b82f6 !important; }
      `}</style>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "14px 24px",
                    borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600,
                    background: toast.type === "error" ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "linear-gradient(135deg, #059669, #047857)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease",
                    display: "flex", alignItems: "center", gap: 8, maxWidth: 400
                }}>
                    {toast.type === "error" ? "✕" : "✓"} {toast.message}
                </div>
            )}

            {/* ========== NAVIGATION BAR ========== */}
            <nav style={{
                width: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                borderBottom: "1px solid #1e3a5f", padding: "0 32px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                height: 64, position: "sticky", top: 0, zIndex: 50
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* Company Logo - Click to upload */}
                    <div
                        onClick={() => document.getElementById('logo-upload-input').click()}
                        style={{
                            width: 48, height: 48, borderRadius: 10,
                            background: "linear-gradient(135deg, #1e293b, #334155)",
                            border: "2px solid #3b82f6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            overflow: "hidden", flexShrink: 0, cursor: "pointer",
                            position: "relative", transition: "border-color 0.2s"
                        }}
                        title="Click to upload company logo"
                    >
                        <input id="logo-upload-input" type="file" accept="image/*" hidden
                            onChange={e => handleLogoUpload(e.target.files[0])} />
                        {companyLogo ? (
                            <>
                                <img src={companyLogo} alt="Company Logo"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <div style={{
                                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: 0, transition: 'opacity .2s', fontSize: 16
                                }} onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                   onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                    📷
                                </div>
                            </>
                        ) : (
                            <span style={{ fontSize: 22, color: '#64748b' }}>📷</span>
                        )}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: -0.3 }}>
                            {getUser().businessName || 'B2B Wholesale System'}
                        </h1>
                        <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{getUser().businessType || 'Product Management'}</p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Role Switch */}
                    <div style={{
                        display: "flex", background: "#0a0f1a", borderRadius: 10, padding: 3,
                        border: "1px solid #1e293b"
                    }}>
                        {[
                            { key: "seller", label: "🔧 Seller", color: "#f59e0b" },
                            { key: "buyer", label: "🛒 Buyer", color: "#3b82f6" }
                        ].map(r => (
                            <button key={r.key} onClick={() => setRole(r.key)} style={{
                                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                                fontSize: 13, fontWeight: 700, transition: "all 0.2s",
                                background: role === r.key ? (r.key === "seller" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #3b82f6, #2563eb)") : "transparent",
                                color: role === r.key ? "#fff" : "#64748b"
                            }}>
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Cart button for buyer */}
                    {role === "buyer" && (
                        <button onClick={() => setShowCart(true)} className="btn-hover" style={{
                            background: "#1e293b", border: "1px solid #334155", borderRadius: 10,
                            padding: "8px 16px", color: "#e2e8f0", cursor: "pointer", fontSize: 14,
                            fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
                            position: "relative", transition: "all 0.2s"
                        }}>
                            🛒 Cart
                            {cartItems.length > 0 && (
                                <span style={{
                                    position: "absolute", top: -6, right: -6, background: "#ef4444",
                                    color: "#fff", borderRadius: "50%", width: 20, height: 20,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, fontWeight: 800
                                }}>{cartItems.length}</span>
                            )}
                        </button>
                    )}
                </div>
            </nav>

            {/* ========== ADMIN / SELLER VIEW ========== */}
            {role === "seller" && (
                <div style={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
                    {/* Admin Header */}
                    <div style={{
                        width: "100%", padding: "24px 32px",
                        background: "linear-gradient(180deg, #111827 0%, #0a0f1a 100%)",
                        borderBottom: "1px solid #1e293b22"
                    }}>
                        <div style={{ width: "100%" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                <div>
                                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
                                        📦 Product Management
                                    </h2>
                                    <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
                                        Manage your wholesale product catalog, pricing, and inventory
                                    </p>
                                </div>
                                <button onClick={openCreate} className="btn-hover" style={{
                                    background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff",
                                    border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14,
                                    fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                                    boxShadow: "0 4px 16px rgba(59,130,246,0.3)", transition: "all 0.2s"
                                }}>
                                    + Add Product
                                </button>
                            </div>

                            {/* Stats Cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                                {[
                                    { label: "Total Products", value: stats.total, color: "#3b82f6", icon: "📦", bg: "#172554" },
                                    { label: "Active", value: stats.active, color: "#10b981", icon: "✅", bg: "#052e16" },
                                    { label: "Low Stock (<10)", value: stats.lowStock, color: "#f59e0b", icon: "⚠️", bg: "#451a03" },
                                    { label: "Total Value (LKR)", value: `${stats.totalValue.toLocaleString()}`, color: "#a78bfa", icon: "💰", bg: "#2e1065" },
                                ].map((s, i) => (
                                    <div key={i} style={{
                                        background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14,
                                        padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
                                        transition: "all 0.2s"
                                    }}>
                                        <span style={{ fontSize: 32 }}>{s.icon}</span>
                                        <div>
                                            <div style={{ color: s.color, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                                            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div style={{ width: "100%", padding: "20px 32px" }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                            <input
                                type="text" placeholder="🔍  Search by name or SKU..."
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    flex: 1, padding: "12px 18px", background: "#111827",
                                    border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0",
                                    fontSize: 14, outline: "none"
                                }}
                            />
                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                                    style={{
                                        padding: "12px 18px", background: "#111827", border: "1px solid #1e293b",
                                        borderRadius: 10, color: "#e2e8f0", fontSize: 14, outline: "none", minWidth: 150
                                    }}>
                                <option value="All">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Product Table */}
                        {loading ? (
                            <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
                                <div style={{ fontSize: 40, marginBottom: 12, animation: "fadeIn 0.5s ease" }}>⏳</div>
                                Loading products...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{
                                textAlign: "center", padding: 60, background: "#111827",
                                borderRadius: 16, border: "1px solid #1e293b"
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                                <p style={{ color: "#94a3b8", fontSize: 16 }}>No products found</p>
                                <button onClick={openCreate} style={{
                                    marginTop: 16, background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                    color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px",
                                    cursor: "pointer", fontWeight: 700, fontSize: 14
                                }}>+ Add Your First Product</button>
                            </div>
                        ) : (
                            <div style={{
                                background: "#111827", borderRadius: 16, border: "1px solid #1e293b", overflow: "hidden"
                            }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                    <tr style={{ background: "#0c1222" }}>
                                        {["Product", "SKU", "Category", "Price (LKR)", "Stock", "MOQ", "Status", "Actions"].map(h => (
                                            <th key={h} style={{
                                                padding: "14px 16px", textAlign: "left", color: "#475569",
                                                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                                                letterSpacing: 0.8, borderBottom: "1px solid #1e293b"
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filtered.map((product, idx) => (
                                        <tr key={product.id} className="hover-row" style={{
                                            borderBottom: "1px solid #1e293b15",
                                            background: idx % 2 === 0 ? "#111827" : "#0d1321",
                                            transition: "background 0.15s", cursor: "pointer"
                                        }}>
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                                        <div style={{
                                                            width: 42, height: 42, borderRadius: 10, background: "#1e293b",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: 20, overflow: "hidden"
                                                        }}>{product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                                                        ) : null}
                                                        <span style={{ display: product.imageUrl ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>{getCategoryIcon(product.category)}</span>
                                                        </div>
                                                        {product.imageUrl2 && (
                                                            <div style={{
                                                                width: 42, height: 42, borderRadius: 10, background: "#1e293b",
                                                                overflow: "hidden"
                                                            }}>
                                                                <img src={product.imageUrl2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = 'none'} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{product.name}</div>
                                                        <div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>
                                                            {(product.description || "").substring(0, 45)}{(product.description || "").length > 45 ? "..." : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: 13, fontFamily: "'Consolas', monospace" }}>{product.sku}</td>
                                            <td style={{ padding: "14px 16px" }}>
                          <span style={{
                              background: "#1e293b", color: "#60a5fa", padding: "5px 12px",
                              borderRadius: 8, fontSize: 12, fontWeight: 600
                          }}>{product.category}</span>
                                            </td>
                                            <td style={{ padding: "14px 16px", color: "#10b981", fontWeight: 700, fontSize: 15 }}>
                                                {parseFloat(product.basePrice || 0).toLocaleString()}
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                          <span style={{
                              color: (product.stock || 0) < 10 ? "#f59e0b" : "#10b981",
                              fontWeight: 700, fontSize: 14
                          }}>
                            {product.stock || 0}
                              <span style={{ color: "#475569", fontSize: 12, marginLeft: 4 }}>{product.unit}</span>
                          </span>
                                            </td>
                                            <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: 13 }}>{product.moq}</td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <button onClick={() => handleToggle(product.id)} style={{
                                                    background: product.isActive !== false ? "#052e16" : "#2d1215",
                                                    color: product.isActive !== false ? "#34d399" : "#f87171",
                                                    border: `1px solid ${product.isActive !== false ? "#10b981" : "#ef4444"}33`,
                                                    borderRadius: 20, padding: "5px 14px", fontSize: 12,
                                                    fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                                                }}>{product.isActive !== false ? "● Active" : "○ Inactive"}</button>
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button onClick={() => setViewProduct(product)} title="View" style={{
                                                        background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                                                        padding: "7px 10px", cursor: "pointer", fontSize: 14, transition: "all 0.2s"
                                                    }}>👁️</button>
                                                    <button onClick={() => openEdit(product)} title="Edit" style={{
                                                        background: "#172554", border: "1px solid #1e40af33", borderRadius: 8,
                                                        padding: "7px 10px", cursor: "pointer", fontSize: 14, transition: "all 0.2s"
                                                    }}>✏️</button>
                                                    <button onClick={() => setDeleteConfirm(product)} title="Delete" style={{
                                                        background: "#2d1215", border: "1px solid #ef444433", borderRadius: 8,
                                                        padding: "7px 10px", cursor: "pointer", fontSize: 14, transition: "all 0.2s"
                                                    }}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div style={{
                                    padding: "12px 16px", borderTop: "1px solid #1e293b",
                                    color: "#475569", fontSize: 12, textAlign: "right"
                                }}>
                                    Showing {filtered.length} of {products.length} products
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========== RFQ SECTION FOR SELLER ========== */}
                    <div style={{ width: "100%", padding: "24px 32px", background: "linear-gradient(180deg, #0a0f1a 0%, #111827 100%)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                                    📋 Quote Requests (RFQ)
                                    {rfqs.filter(r => r.status === 'PENDING').length > 0 && (
                                        <span style={{ background: "#ef4444", color: "#fff", borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                                            {rfqs.filter(r => r.status === 'PENDING').length} New
                                        </span>
                                    )}
                                </h2>
                                <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
                                    Respond to buyer pricing inquiries and create custom quotes
                                </p>
                            </div>
                            <button onClick={fetchRfqs} style={{
                                padding: "8px 16px", background: "#1e293b", border: "1px solid #334155",
                                borderRadius: 8, color: "#e2e8f0", cursor: "pointer", fontSize: 13, fontWeight: 600
                            }}>🔄 Refresh</button>
                        </div>

                        {rfqLoading ? (
                            <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading RFQs...</div>
                        ) : rfqs.length === 0 ? (
                            <div style={{
                                textAlign: "center", padding: "40px 20px", background: "#1e293b44",
                                borderRadius: 12, border: "1px solid #334155"
                            }}>
                                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                                <div style={{ color: "#94a3b8", fontSize: 14 }}>No quote requests yet</div>
                                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>When buyers send RFQs from the Marketplace, they will appear here</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {rfqs.map(rfq => {
                                    const statusColors = {
                                        PENDING: { bg: "#fef3c7", color: "#92400e", label: "⏳ Pending" },
                                        QUOTED: { bg: "#dbeafe", color: "#1e40af", label: "💬 Quoted" },
                                        ACCEPTED: { bg: "#dcfce7", color: "#166534", label: "✅ Accepted" },
                                        ORDERED: { bg: "#d1fae5", color: "#065f46", label: "🛒 Ordered" },
                                        REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "❌ Rejected" },
                                        EXPIRED: { bg: "#f3f4f6", color: "#6b7280", label: "⏰ Expired" },
                                    };
                                    const st = statusColors[rfq.status] || statusColors.PENDING;
                                    return (
                                        <div key={rfq.id} style={{
                                            background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
                                            padding: "18px 22px", transition: "all 0.2s",
                                            borderLeft: rfq.status === 'PENDING' ? '3px solid #f59e0b' : rfq.status === 'QUOTED' ? '3px solid #3b82f6' : '3px solid #334155'
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{rfq.rfqNumber}</span>
                                                        <span style={{
                                                            padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                                                            background: st.bg, color: st.color
                                                        }}>{st.label}</span>
                                                    </div>
                                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
                                                        {rfq.product?.name || 'Unknown Product'}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                                        Buyer: <b style={{ color: "#e2e8f0" }}>{rfq.buyerBusiness?.name || 'Unknown'}</b>
                                                        &nbsp;&nbsp;·&nbsp;&nbsp;Qty: <b style={{ color: "#e2e8f0" }}>{rfq.requestedQuantity}</b> {rfq.product?.unit || 'units'}
                                                        &nbsp;&nbsp;·&nbsp;&nbsp;Base Price: <b style={{ color: "#10b981" }}>${Number(rfq.product?.basePrice || 0).toLocaleString()}</b>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 11, color: "#64748b", textAlign: "right" }}>
                                                    {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : ''}
                                                </div>
                                            </div>

                                            {rfq.message && (
                                                <div style={{
                                                    background: "#0f172a", borderRadius: 8, padding: "10px 14px",
                                                    fontSize: 13, color: "#94a3b8", marginBottom: 12, borderLeft: "3px solid #334155"
                                                }}>
                                                    💬 "{rfq.message}"
                                                </div>
                                            )}

                                            {rfq.status === 'QUOTED' && (
                                                <div style={{
                                                    background: "#172554", borderRadius: 8, padding: "10px 14px",
                                                    fontSize: 13, marginBottom: 12, border: "1px solid #1e40af33"
                                                }}>
                                                    <span style={{ color: "#93c5fd" }}>Your Quote: </span>
                                                    <b style={{ color: "#60a5fa" }}>${Number(rfq.offeredPrice || 0).toLocaleString()}</b>/unit
                                                    {rfq.offeredDiscount > 0 && <span style={{ color: "#fbbf24" }}> ({rfq.offeredDiscount}% discount)</span>}
                                                    &nbsp;&nbsp;·&nbsp;&nbsp;Total: <b style={{ color: "#10b981" }}>${Number(rfq.offeredTotal || 0).toLocaleString()}</b>
                                                    {rfq.validUntil && <span style={{ color: "#64748b" }}> · Valid until {rfq.validUntil}</span>}
                                                    {rfq.sellerNotes && <div style={{ color: "#94a3b8", marginTop: 4, fontSize: 12 }}>Note: {rfq.sellerNotes}</div>}
                                                </div>
                                            )}

                                            {rfq.status === 'ORDERED' && rfq.orderId && (
                                                <div style={{
                                                    background: "#052e16", borderRadius: 8, padding: "10px 14px",
                                                    fontSize: 13, marginBottom: 12, border: "1px solid #16a34a33"
                                                }}>
                                                    <span style={{ color: "#86efac" }}>Order Created: </span>
                                                    <b style={{ color: "#4ade80" }}>Order #{rfq.orderId}</b>
                                                    <span style={{ color: "#64748b" }}> — Check Order Management for details</span>
                                                </div>
                                            )}

                                            {rfq.status === 'PENDING' && (
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button onClick={() => {
                                                        setRespondingRfq(rfq);
                                                        setRfqResponse({
                                                            offeredPrice: String(rfq.product?.basePrice || ''),
                                                            offeredDiscount: '',
                                                            sellerNotes: '',
                                                            validDays: 7
                                                        });
                                                    }} style={{
                                                        padding: "8px 18px", background: "linear-gradient(135deg, #16a34a, #15803d)",
                                                        border: "none", borderRadius: 8, color: "#fff", cursor: "pointer",
                                                        fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6
                                                    }}>💰 Send Quote</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RFQ RESPOND MODAL */}
                    {respondingRfq && (
                        <div onClick={() => setRespondingRfq(null)} style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1000,
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <div onClick={e => e.stopPropagation()} style={{
                                background: "#1e293b", borderRadius: 16, padding: 28, width: 460,
                                maxWidth: "90vw", border: "1px solid #334155", boxShadow: "0 20px 60px rgba(0,0,0,.4)"
                            }}>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>💰 Send Quote</h3>
                                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>
                                    Respond to {respondingRfq.buyerBusiness?.name}'s request for {respondingRfq.product?.name}
                                </p>

                                <div style={{
                                    background: "#0f172a", borderRadius: 10, padding: "12px 16px", marginBottom: 18,
                                    border: "1px solid #334155"
                                }}>
                                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Request Details</div>
                                    <div style={{ fontSize: 14, color: "#e2e8f0" }}>
                                        <b>{respondingRfq.requestedQuantity}</b> {respondingRfq.product?.unit || 'units'} of <b>{respondingRfq.product?.name}</b>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                        Base price: ${Number(respondingRfq.product?.basePrice || 0).toLocaleString()}/{respondingRfq.product?.unit || 'unit'}
                                    </div>
                                    {respondingRfq.message && (
                                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, fontStyle: "italic" }}>
                                            "{respondingRfq.message}"
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                                        Offered Price per Unit ($)
                                    </label>
                                    <input type="number" value={rfqResponse.offeredPrice} onChange={e => setRfqResponse(p => ({ ...p, offeredPrice: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #334155",
                                            borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box"
                                        }} placeholder="Enter price per unit" />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                                        Discount (%)
                                    </label>
                                    <input type="number" value={rfqResponse.offeredDiscount} onChange={e => setRfqResponse(p => ({ ...p, offeredDiscount: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #334155",
                                            borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box"
                                        }} placeholder="Optional discount %" />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                                        Quote Valid For (Days)
                                    </label>
                                    <input type="number" value={rfqResponse.validDays} onChange={e => setRfqResponse(p => ({ ...p, validDays: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #334155",
                                            borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box"
                                        }} placeholder="7" />
                                </div>

                                <div style={{ marginBottom: 18 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                                        Notes to Buyer
                                    </label>
                                    <textarea rows={3} value={rfqResponse.sellerNotes} onChange={e => setRfqResponse(p => ({ ...p, sellerNotes: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #334155",
                                            borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box"
                                        }} placeholder="Delivery timeline, terms, special offers..." />
                                </div>

                                {rfqResponse.offeredPrice && (
                                    <div style={{
                                        background: "#052e16", borderRadius: 8, padding: "12px 16px", marginBottom: 18,
                                        border: "1px solid #16a34a33"
                                    }}>
                                        <div style={{ fontSize: 12, color: "#86efac", marginBottom: 4 }}>Quote Summary</div>
                                        <div style={{ fontSize: 14, color: "#4ade80", fontWeight: 700 }}>
                                            ${Number(rfqResponse.offeredPrice).toLocaleString()} × {respondingRfq.requestedQuantity} units
                                            {rfqResponse.offeredDiscount > 0 && ` - ${rfqResponse.offeredDiscount}% discount`}
                                            {' = '}
                                            <span style={{ fontSize: 16 }}>
                                                ${(() => {
                                                    let total = Number(rfqResponse.offeredPrice) * respondingRfq.requestedQuantity;
                                                    if (rfqResponse.offeredDiscount > 0) total -= total * Number(rfqResponse.offeredDiscount) / 100;
                                                    return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => setRespondingRfq(null)} style={{
                                        flex: 1, padding: "10px", background: "#0f172a", border: "1px solid #334155",
                                        borderRadius: 8, color: "#e2e8f0", cursor: "pointer", fontSize: 14, fontWeight: 600
                                    }}>Cancel</button>
                                    <button onClick={() => handleRespondRfq(respondingRfq.id)}
                                        disabled={!rfqResponse.offeredPrice || Number(rfqResponse.offeredPrice) <= 0}
                                        style={{
                                            flex: 1, padding: "10px",
                                            background: rfqResponse.offeredPrice && Number(rfqResponse.offeredPrice) > 0 ? "linear-gradient(135deg, #16a34a, #15803d)" : "#334155",
                                            border: "none", borderRadius: 8, color: "#fff", cursor: rfqResponse.offeredPrice ? "pointer" : "not-allowed",
                                            fontSize: 14, fontWeight: 700
                                        }}>Send Quote to Buyer</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========== BUYER VIEW ========== */}
            {role === "buyer" && (
                <div style={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
                    {/* Buyer Header */}
                    <div style={{
                        width: "100%", padding: "32px",
                        background: "linear-gradient(135deg, #172554 0%, #0f172a 50%, #1e1b4b 100%)",
                        borderBottom: "1px solid #1e3a5f22"
                    }}>
                        <div style={{ width: "100%" }}>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
                                🛍️ Product Catalog
                            </h2>
                            <p style={{ color: "#94a3b8", fontSize: 14, margin: "6px 0 20px" }}>
                                Browse wholesale products and place bulk orders
                            </p>
                            <div style={{ display: "flex", gap: 12 }}>
                                <input
                                    type="text" placeholder="🔍  Search products..."
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    style={{
                                        flex: 1, padding: "12px 18px", background: "#0a0f1a",
                                        border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0",
                                        fontSize: 14, outline: "none"
                                    }}
                                />
                                <div style={{ display: "flex", gap: 6, background: "#0a0f1a", borderRadius: 10, padding: 3, border: "1px solid #1e293b" }}>
                                    {["All", ...CATEGORIES].map(c => (
                                        <button key={c} onClick={() => setFilterCategory(c)} style={{
                                            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                                            fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                                            background: filterCategory === c ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "transparent",
                                            color: filterCategory === c ? "#fff" : "#64748b"
                                        }}>{c}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Cards Grid */}
                    <div style={{ width: "100%", padding: "24px 32px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>⏳ Loading catalog...</div>
                        ) : filtered.length === 0 ? (
                            <div style={{
                                textAlign: "center", padding: 60, background: "#111827",
                                borderRadius: 16, border: "1px solid #1e293b"
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                                <p style={{ color: "#94a3b8" }}>No products match your search</p>
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                gap: 20
                            }}>
                                {filtered.map((product) => (
                                    <div key={product.id} className="card-hover" style={{
                                        background: "#111827", borderRadius: 16, border: "1px solid #1e293b",
                                        overflow: "hidden", transition: "all 0.3s", cursor: "pointer"
                                    }}>
                                        {/* Card Header */}
                                        <div style={{
                                            height: 180, background: `linear-gradient(135deg, ${product.category === "Electronics" ? "#172554, #1e1b4b" : product.category === "FMCG" ? "#052e16, #14532d" : "#451a03, #78350f"})`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            position: "relative", overflow: "hidden"
                                        }}>
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} style={{
                                                    width: "100%", height: "100%", objectFit: "cover"
                                                }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
                                            ) : null}
                                            <span style={{ fontSize: 48, display: product.imageUrl ? "none" : "block" }}>{getCategoryIcon(product.category)}</span>
                                            <span style={{
                                                position: "absolute", top: 12, right: 12, background: "#0a0f1a99",
                                                color: "#60a5fa", padding: "4px 10px", borderRadius: 6,
                                                fontSize: 11, fontWeight: 600, backdropFilter: "blur(8px)"
                                            }}>{product.category}</span>
                                            {(product.stock || 0) < 10 && (
                                                <span style={{
                                                    position: "absolute", top: 12, left: 12, background: "#dc262699",
                                                    color: "#fca5a5", padding: "4px 10px", borderRadius: 6,
                                                    fontSize: 11, fontWeight: 600
                                                }}>Low Stock</span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div style={{ padding: "16px 20px" }}>
                                            <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
                                                {product.name}
                                            </h3>
                                            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
                                                {(product.description || "No description").substring(0, 80)}
                                            </p>

                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                                <div>
                          <span style={{ color: "#10b981", fontSize: 24, fontWeight: 800 }}>
                            LKR {parseFloat(product.basePrice || 0).toLocaleString()}
                          </span>
                                                    <span style={{ color: "#475569", fontSize: 12, marginLeft: 4 }}>/{product.unit}</span>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ color: "#94a3b8", fontSize: 12 }}>Stock: {product.stock || 0}</div>
                                                    <div style={{ color: "#f59e0b", fontSize: 11 }}>MOQ: {product.moq}</div>
                                                </div>
                                            </div>

                                            {/* Quantity + Add to Cart */}
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <input
                                                    type="number"
                                                    min={product.moq}
                                                    max={product.stock || 0}
                                                    value={buyerQuantities[product.id] || product.moq}
                                                    onChange={e => setBuyerQuantities({ ...buyerQuantities, [product.id]: parseInt(e.target.value) || product.moq })}
                                                    style={{
                                                        width: 80, padding: "10px 8px", background: "#0a0f1a",
                                                        border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0",
                                                        fontSize: 14, textAlign: "center", outline: "none"
                                                    }}
                                                />
                                                <button onClick={() => addToCart(product)} className="btn-hover" style={{
                                                    flex: 1, padding: "10px 0",
                                                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                                    color: "#fff", border: "none", borderRadius: 8,
                                                    fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                                                }}>
                                                    🛒 Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========== CART MODAL (Buyer) ========== */}
            {showCart && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
                }} onClick={() => setShowCart(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: "#111827", borderRadius: 20, border: "1px solid #1e293b",
                        padding: 28, width: 500, maxHeight: "80vh", overflowY: "auto",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.5)", animation: "fadeIn 0.2s ease"
                    }}>
                        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>
                            🛒 Shopping Cart ({cartItems.length} items)
                        </h2>

                        {cartItems.length === 0 ? (
                            <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <>
                                {cartItems.map(item => (
                                    <div key={item.product.id} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "14px 0", borderBottom: "1px solid #1e293b"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <span style={{ fontSize: 24 }}>{getCategoryIcon(item.product.category)}</span>
                                            <div>
                                                <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{item.product.name}</div>
                                                <div style={{ color: "#64748b", fontSize: 12 }}>
                                                    {item.quantity} × LKR {parseFloat(item.product.basePrice).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>
                        LKR {(item.quantity * parseFloat(item.product.basePrice)).toLocaleString()}
                      </span>
                                            <button onClick={() => removeFromCart(item.product.id)} style={{
                                                background: "#2d1215", border: "none", borderRadius: 6,
                                                padding: "4px 8px", cursor: "pointer", fontSize: 12, color: "#f87171"
                                            }}>✕</button>
                                        </div>
                                    </div>
                                ))}

                                <div style={{
                                    marginTop: 20, padding: "16px 0", borderTop: "2px solid #1e293b",
                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}>
                                    <span style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600 }}>Total:</span>
                                    <span style={{ color: "#10b981", fontSize: 28, fontWeight: 800 }}>
                    LKR {cartTotal.toLocaleString()}
                  </span>
                                </div>

                                <button onClick={() => { showToast("Order placed successfully! (Demo)"); setCartItems([]); setShowCart(false); }}
                                        className="btn-hover" style={{
                                    width: "100%", marginTop: 16, padding: "14px 0",
                                    background: "linear-gradient(135deg, #10b981, #059669)",
                                    color: "#fff", border: "none", borderRadius: 12,
                                    fontWeight: 700, fontSize: 16, cursor: "pointer", transition: "all 0.2s"
                                }}>
                                    ✓ Place Order
                                </button>
                            </>
                        )}

                        <button onClick={() => setShowCart(false)} style={{
                            width: "100%", marginTop: 10, padding: "12px 0", background: "#1e293b",
                            color: "#94a3b8", border: "1px solid #334155", borderRadius: 10,
                            fontWeight: 600, cursor: "pointer"
                        }}>Close</button>
                    </div>
                </div>
            )}

            {/* ========== ADD/EDIT FORM MODAL ========== */}
            <ProductFormModal
                show={showForm}
                onClose={() => { setShowForm(false); setEditingProduct(null); }}
                onSubmit={handleFormSubmit}
                editingProduct={editingProduct}
            />

            {/* ========== VIEW PRODUCT MODAL ========== */}
            {viewProduct && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
                }} onClick={() => setViewProduct(null)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: "#111827", borderRadius: 20, border: "1px solid #1e293b",
                        padding: 28, width: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                        animation: "fadeIn 0.2s ease"
                    }}>
                        {viewProduct.imageUrl && (
                            <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16, height: 200, background: "#0a0f1a" }}>
                                <img src={viewProduct.imageUrl} alt={viewProduct.name} style={{
                                    width: "100%", height: "100%", objectFit: "cover"
                                }} onError={e => { e.target.parentElement.style.display = "none"; }} />
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: 0 }}>
                                {getCategoryIcon(viewProduct.category)} {viewProduct.name}
                            </h2>
                            <span style={{
                                background: viewProduct.isActive !== false ? "#052e16" : "#2d1215",
                                color: viewProduct.isActive !== false ? "#34d399" : "#f87171",
                                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600
                            }}>{viewProduct.isActive !== false ? "Active" : "Inactive"}</span>
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: "12px 0 16px" }}>
                            {viewProduct.description || "No description available"}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {[
                                { label: "SKU Code", value: viewProduct.sku },
                                { label: "Category", value: viewProduct.category },
                                { label: "Base Price", value: `LKR ${parseFloat(viewProduct.basePrice || 0).toLocaleString()}` },
                                { label: "Stock", value: `${viewProduct.stock || 0} ${viewProduct.unit}` },
                                { label: "Min Order Qty", value: `${viewProduct.moq} ${viewProduct.unit}` },
                                { label: "Created", value: viewProduct.createdAt ? new Date(viewProduct.createdAt).toLocaleDateString() : "—" },
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: "#0a0f1a", borderRadius: 10, padding: "12px 14px",
                                    border: "1px solid #1e293b"
                                }}>
                                    <div style={{ color: "#475569", fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>{item.label}</div>
                                    <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setViewProduct(null)} style={{
                            width: "100%", marginTop: 18, padding: "12px 0", background: "#1e293b",
                            color: "#94a3b8", border: "1px solid #334155", borderRadius: 10,
                            fontWeight: 600, cursor: "pointer"
                        }}>Close</button>
                    </div>
                </div>
            )}

            {/* ========== DELETE CONFIRM MODAL ========== */}
            {deleteConfirm && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
                }}>
                    <div style={{
                        background: "#111827", borderRadius: 20, border: "1px solid #3b1219",
                        padding: 28, width: 400, textAlign: "center",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.5)", animation: "fadeIn 0.2s ease"
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                        <h3 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Delete Product?</h3>
                        <p style={{ color: "#94a3b8", fontSize: 14 }}>
                            Are you sure you want to delete <strong style={{ color: "#f87171" }}>{deleteConfirm.name}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-hover" style={{
                                flex: 1, padding: "12px 0", background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                                color: "#fff", border: "none", borderRadius: 10, fontWeight: 700,
                                cursor: "pointer", transition: "all 0.2s"
                            }}>Yes, Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                                flex: 1, padding: "12px 0", background: "#1e293b", color: "#94a3b8",
                                border: "1px solid #334155", borderRadius: 10, fontWeight: 600, cursor: "pointer"
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}