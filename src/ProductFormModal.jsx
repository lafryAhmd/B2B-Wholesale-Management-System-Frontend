import { useState, useEffect, useRef } from "react";

const CATEGORIES = ["Electronics", "FMCG", "Textiles"];
const UNITS = ["piece", "kg", "box", "roll", "carton", "pack"];

const emptyForm = {
    name: "", description: "", sku: "", basePrice: "",
    moq: 1, unit: "piece", category: "Electronics",
    stock: 0, imageUrl: "", imageUrl2: "", isActive: true
};

const emptyErrors = {
    name: "", sku: "", description: "", basePrice: "",
    moq: "", stock: "", imageUrl: "", imageUrl2: "", category: "", unit: ""
};

export default function ProductFormModal({ show, onClose, onSubmit, editingProduct }) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState(emptyErrors);
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [dragOver1, setDragOver1] = useState(false);
    const [dragOver2, setDragOver2] = useState(false);
    const fileRef1 = useRef(null);
    const fileRef2 = useRef(null);

    const handleImageFile = (file, field) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
        const reader = new FileReader();
        reader.onload = (e) => handleChange(field, e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e, field, setDrag) => {
        e.preventDefault();
        setDrag(false);
        const file = e.dataTransfer.files[0];
        handleImageFile(file, field);
    };

    useEffect(() => {
        if (editingProduct) {
            setForm({
                name: editingProduct.name || "",
                description: editingProduct.description || "",
                sku: editingProduct.sku || "",
                basePrice: editingProduct.basePrice || "",
                moq: editingProduct.moq || 1,
                unit: editingProduct.unit || "piece",
                category: editingProduct.category || "Electronics",
                stock: editingProduct.stock || 0,
                imageUrl: editingProduct.imageUrl || "",
                imageUrl2: editingProduct.imageUrl2 || "",
                isActive: editingProduct.isActive !== false
            });
        } else {
            setForm(emptyForm);
        }
        setErrors(emptyErrors);
        setTouched({});
        setSubmitting(false);
    }, [editingProduct, show]);

    // --- Validation Rules ---
    const validateField = (key, value) => {
        switch (key) {
            case "name": {
                const v = (value || "").trim();
                if (!v) return "Product name is required";
                if (v.length < 2) return "Name must be at least 2 characters";
                if (v.length > 100) return "Name must be less than 100 characters";
                if (/^\d+$/.test(v)) return "Name cannot be only numbers";
                return "";
            }
            case "sku": {
                const v = (value || "").trim();
                if (!v) return "SKU code is required";
                if (v.length < 2) return "SKU must be at least 2 characters";
                if (v.length > 30) return "SKU must be less than 30 characters";
                if (!/^[A-Za-z0-9\-_]+$/.test(v)) return "SKU can only contain letters, numbers, hyphens and underscores";
                return "";
            }
            case "description": {
                const v = (value || "").trim();
                if (v.length > 500) return "Description must be less than 500 characters";
                return "";
            }
            case "basePrice": {
                if (value === "" || value === null || value === undefined) return "Base price is required";
                const num = parseFloat(value);
                if (isNaN(num)) return "Price must be a valid number";
                if (num <= 0) return "Price must be greater than 0";
                if (num > 99999999.99) return "Price cannot exceed 99,999,999.99";
                return "";
            }
            case "stock": {
                const num = parseInt(value);
                if (isNaN(num)) return "Stock must be a valid number";
                if (num < 0) return "Stock cannot be negative";
                if (num > 999999) return "Stock cannot exceed 999,999";
                if (!Number.isInteger(Number(value))) return "Stock must be a whole number";
                return "";
            }
            case "moq": {
                if (value === "" || value === null || value === undefined) return "MOQ is required";
                const num = parseInt(value);
                if (isNaN(num)) return "MOQ must be a valid number";
                if (num < 1) return "MOQ must be at least 1";
                if (num > 999999) return "MOQ cannot exceed 999,999";
                if (!Number.isInteger(Number(value))) return "MOQ must be a whole number";
                return "";
            }
            case "imageUrl": {
                const v = (value || "").trim();
                if (v && !/^https?:\/\/.+\..+/.test(v)) return "Enter a valid URL (http:// or https://)";
                return "";
            }
            case "category": {
                if (!CATEGORIES.includes(value)) return "Please select a valid category";
                return "";
            }
            case "unit": {
                if (!UNITS.includes(value)) return "Please select a valid unit";
                return "";
            }
            default:
                return "";
        }
    };

    const validateAll = () => {
        const newErrors = {};
        let hasError = false;
        for (const key of Object.keys(emptyErrors)) {
            const err = validateField(key, form[key]);
            newErrors[key] = err;
            if (err) hasError = true;
        }
        // Cross-field: MOQ should not exceed stock (if stock is set)
        if (!newErrors.moq && !newErrors.stock) {
            const stock = parseInt(form.stock) || 0;
            const moq = parseInt(form.moq) || 1;
            if (stock > 0 && moq > stock) {
                newErrors.moq = "MOQ cannot exceed current stock (" + stock + ")";
                hasError = true;
            }
        }
        setErrors(newErrors);
        return !hasError;
    };

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (touched[key]) {
            setErrors(prev => ({ ...prev, [key]: validateField(key, value) }));
        }
    };

    const handleBlur = (key) => {
        setTouched(prev => ({ ...prev, [key]: true }));
        setErrors(prev => ({ ...prev, [key]: validateField(key, form[key]) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Mark all as touched
        const allTouched = {};
        for (const key of Object.keys(emptyErrors)) allTouched[key] = true;
        setTouched(allTouched);

        if (!validateAll()) return;

        setSubmitting(true);
        try {
            await onSubmit({
                ...form,
                name: form.name.trim(),
                sku: form.sku.trim(),
                description: form.description.trim(),
                imageUrl: (form.imageUrl || '').trim(),
                imageUrl2: (form.imageUrl2 || '').trim(),
                basePrice: parseFloat(form.basePrice) || 0,
                stock: parseInt(form.stock) || 0,
                moq: parseInt(form.moq) || 1
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    const inputStyle = (key) => ({
        width: "100%", padding: "10px 14px", background: "#0a0f1a",
        border: `1px solid ${touched[key] && errors[key] ? "#ef4444" : "#1e293b"}`,
        borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none",
        boxSizing: "border-box", transition: "border-color 0.2s"
    });

    const errorStyle = {
        color: "#f87171", fontSize: 11, marginTop: 4, minHeight: 16, fontWeight: 500
    };

    const labelStyle = {
        color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6
    };

    const charCount = (val, max) => {
        const len = (val || "").length;
        return len > max * 0.8 ? (
            <span style={{ fontSize: 11, color: len > max ? "#ef4444" : "#f59e0b", float: "right" }}>
                {len}/{max}
            </span>
        ) : null;
    };

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
        }} onClick={() => { if (!submitting) onClose(); }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "#111827", borderRadius: 20, border: "1px solid #1e293b",
                padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)", animation: "fadeIn 0.2s ease"
            }}>
                <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>
                    {editingProduct ? "✏️ Edit Product" : "📦 Add New Product"}
                </h2>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Product Name */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>
                            Product Name <span style={{ color: "#ef4444" }}>*</span>
                            {charCount(form.name, 100)}
                        </label>
                        <input type="text" value={form.name}
                            onChange={e => handleChange("name", e.target.value)}
                            onBlur={() => handleBlur("name")}
                            placeholder="e.g. USB-C Cable"
                            maxLength={100}
                            style={inputStyle("name")} />
                        <div style={errorStyle}>{touched.name && errors.name}</div>
                    </div>

                    {/* SKU Code */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>
                            SKU Code <span style={{ color: "#ef4444" }}>*</span>
                            {charCount(form.sku, 30)}
                        </label>
                        <input type="text" value={form.sku}
                            onChange={e => handleChange("sku", e.target.value.toUpperCase())}
                            onBlur={() => handleBlur("sku")}
                            placeholder="e.g. ELEC-USB-001"
                            maxLength={30}
                            style={inputStyle("sku")} />
                        <div style={errorStyle}>{touched.sku && errors.sku}</div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>
                            Description
                            {charCount(form.description, 500)}
                        </label>
                        <textarea value={form.description}
                            onChange={e => handleChange("description", e.target.value)}
                            onBlur={() => handleBlur("description")}
                            placeholder="Detailed product description..."
                            rows={3} maxLength={500}
                            style={{ ...inputStyle("description"), resize: "vertical" }} />
                        <div style={errorStyle}>{touched.description && errors.description}</div>
                    </div>

                    {/* Two-column grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {/* Base Price */}
                        <div>
                            <label style={labelStyle}>Base Price (LKR) <span style={{ color: "#ef4444" }}>*</span></label>
                            <input type="number" value={form.basePrice}
                                onChange={e => handleChange("basePrice", e.target.value)}
                                onBlur={() => handleBlur("basePrice")}
                                placeholder="0.00" step="0.01" min="0.01"
                                style={inputStyle("basePrice")} />
                            <div style={errorStyle}>{touched.basePrice && errors.basePrice}</div>
                        </div>

                        {/* Stock */}
                        <div>
                            <label style={labelStyle}>Stock Quantity</label>
                            <input type="number" value={form.stock}
                                onChange={e => handleChange("stock", e.target.value)}
                                onBlur={() => handleBlur("stock")}
                                placeholder="0" min="0" step="1"
                                style={inputStyle("stock")} />
                            <div style={errorStyle}>{touched.stock && errors.stock}</div>
                        </div>

                        {/* MOQ */}
                        <div>
                            <label style={labelStyle}>MOQ <span style={{ color: "#ef4444" }}>*</span></label>
                            <input type="number" value={form.moq}
                                onChange={e => handleChange("moq", e.target.value)}
                                onBlur={() => handleBlur("moq")}
                                min="1" step="1"
                                style={inputStyle("moq")} />
                            <div style={errorStyle}>{touched.moq && errors.moq}</div>
                        </div>

                        {/* Category */}
                        <div>
                            <label style={labelStyle}>Category <span style={{ color: "#ef4444" }}>*</span></label>
                            <select value={form.category}
                                onChange={e => handleChange("category", e.target.value)}
                                onBlur={() => handleBlur("category")}
                                style={inputStyle("category")}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div style={errorStyle}>{touched.category && errors.category}</div>
                        </div>

                        {/* Unit */}
                        <div>
                            <label style={labelStyle}>Unit <span style={{ color: "#ef4444" }}>*</span></label>
                            <select value={form.unit}
                                onChange={e => handleChange("unit", e.target.value)}
                                onBlur={() => handleBlur("unit")}
                                style={inputStyle("unit")}>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <div style={errorStyle}>{touched.unit && errors.unit}</div>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div style={{ marginTop: 18, marginBottom: 6 }}>
                        <label style={{ ...labelStyle, fontSize: 13, marginBottom: 10 }}>Product Images (up to 2)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {/* Image 1 */}
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver1(true); }}
                                onDragLeave={() => setDragOver1(false)}
                                onDrop={e => handleDrop(e, 'imageUrl', setDragOver1)}
                                onClick={() => !form.imageUrl && fileRef1.current?.click()}
                                style={{
                                    border: `2px dashed ${dragOver1 ? '#3b82f6' : form.imageUrl ? '#1e293b' : '#334155'}`,
                                    borderRadius: 12, background: dragOver1 ? 'rgba(59,130,246,.08)' : '#0a0f1a',
                                    height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input ref={fileRef1} type="file" accept="image/*" hidden
                                    onChange={e => handleImageFile(e.target.files[0], 'imageUrl')} />
                                {form.imageUrl ? (
                                    <>
                                        <img src={form.imageUrl} alt="Product 1"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(0,0,0,.4)', opacity: 0, transition: 'opacity .2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                        }} onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                           onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); fileRef1.current?.click(); }}
                                                style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                Change
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleChange('imageUrl', ''); }}
                                                style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                Remove
                                            </button>
                                        </div>
                                        <div style={{ position: 'absolute', top: 6, left: 6, background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>Main</div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>Main Image</div>
                                        <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>Drop or click to upload</div>
                                    </>
                                )}
                            </div>

                            {/* Image 2 */}
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver2(true); }}
                                onDragLeave={() => setDragOver2(false)}
                                onDrop={e => handleDrop(e, 'imageUrl2', setDragOver2)}
                                onClick={() => !form.imageUrl2 && fileRef2.current?.click()}
                                style={{
                                    border: `2px dashed ${dragOver2 ? '#3b82f6' : form.imageUrl2 ? '#1e293b' : '#334155'}`,
                                    borderRadius: 12, background: dragOver2 ? 'rgba(59,130,246,.08)' : '#0a0f1a',
                                    height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input ref={fileRef2} type="file" accept="image/*" hidden
                                    onChange={e => handleImageFile(e.target.files[0], 'imageUrl2')} />
                                {form.imageUrl2 ? (
                                    <>
                                        <img src={form.imageUrl2} alt="Product 2"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(0,0,0,.4)', opacity: 0, transition: 'opacity .2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                        }} onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                           onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); fileRef2.current?.click(); }}
                                                style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                Change
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleChange('imageUrl2', ''); }}
                                                style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                Remove
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>Second Image</div>
                                        <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>Drop or click to upload</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ color: '#475569', fontSize: 11, marginTop: 6 }}>Supports JPG, PNG, WebP. Max 5MB each. Or paste a URL below:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                            <input type="text" value={form.imageUrl?.startsWith('data:') ? '' : form.imageUrl}
                                onChange={e => handleChange("imageUrl", e.target.value)}
                                placeholder="Image 1 URL (optional)"
                                style={{ ...inputStyle("imageUrl"), fontSize: 12, padding: '8px 10px' }} />
                            <input type="text" value={form.imageUrl2?.startsWith('data:') ? '' : form.imageUrl2}
                                onChange={e => handleChange("imageUrl2", e.target.value)}
                                placeholder="Image 2 URL (optional)"
                                style={{ ...inputStyle("imageUrl2"), fontSize: 12, padding: '8px 10px' }} />
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                        <button type="submit" disabled={submitting} className="btn-hover" style={{
                            flex: 1, padding: "13px 0",
                            background: editingProduct
                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                : "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "#fff", border: "none", borderRadius: 12, fontWeight: 700,
                            fontSize: 15, cursor: submitting ? "not-allowed" : "pointer",
                            opacity: submitting ? 0.7 : 1, transition: "all 0.2s"
                        }}>
                            {submitting
                                ? (editingProduct ? "Updating..." : "Creating...")
                                : (editingProduct ? "Update Product" : "Create Product")}
                        </button>
                        <button type="button" disabled={submitting}
                            onClick={onClose}
                            style={{
                                padding: "13px 24px", background: "#1e293b", color: "#94a3b8",
                                border: "1px solid #334155", borderRadius: 12, fontWeight: 600,
                                fontSize: 14, cursor: submitting ? "not-allowed" : "pointer"
                            }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
