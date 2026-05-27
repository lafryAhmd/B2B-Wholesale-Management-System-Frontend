import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const categoryIcons = {
  'Electronics': '📱', 'Apparel': '👔', 'Industrial': '🔧', 'Home & Kitchen': '🍳',
  'Health & Beauty': '💧', 'Food & Beverage': '☕', 'FMCG': '🛒', 'Textiles': '👕',
  'Auto Parts': '🚗', 'Tools': '🛠️', 'Sports': '⚽', 'Office': '📎',
}

function getIcon(name, cat) {
  if (categoryIcons[cat]) return categoryIcons[cat]
  const n = (name || '').toLowerCase()
  if (n.includes('usb') || n.includes('charger') || n.includes('cable')) return '🔌'
  if (n.includes('shirt') || n.includes('cloth')) return '👔'
  if (n.includes('chip') || n.includes('snack') || n.includes('food')) return '🍿'
  if (n.includes('shoe')) return '👟'
  return '📦'
}

function Stars({ rating, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : 'none'} stroke={i <= rating ? '#f59e0b' : '#d1d5db'} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

function TimeAgo({ date }) {
  if (!date) return null
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return <span>{diff}s ago</span>
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>
  if (diff < 2592000) return <span>{Math.floor(diff / 86400)}d ago</span>
  return <span>{d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = (user.businessName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const [product, setProduct] = useState(null)
  const [business, setBusiness] = useState(null)
  const [bulkPricing, setBulkPricing] = useState([])
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0, distribution: {} })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reviews')
  const [filterRating, setFilterRating] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', qualityRating: 5, valueRating: 5, shippingRating: 5 })
  const [submitting, setSubmitting] = useState(false)
  const [buyQty, setBuyQty] = useState('')
  const [priceCalc, setPriceCalc] = useState(null)
  const [selectedImg, setSelectedImg] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [prodRes, pricingRes, reviewsRes, summaryRes] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get(`/api/products/${id}/pricing`).catch(() => ({ data: [] })),
          axios.get(`/api/reviews/product/${id}`).catch(() => ({ data: [] })),
          axios.get(`/api/reviews/product/${id}/summary`).catch(() => ({ data: { averageRating: 0, totalReviews: 0, distribution: {} } })),
        ])
        const prod = prodRes.data
        setProduct(prod)
        setBuyQty(String(prod.moq || 1))
        setBulkPricing(pricingRes.data || [])
        setReviews(reviewsRes.data || [])
        setSummary(summaryRes.data || { averageRating: 0, totalReviews: 0, distribution: {} })

        if (prod.business) {
          setBusiness(prod.business)
        } else if (prod.businessId) {
          const bizRes = await axios.get(`/api/businesses/${prod.businessId}`)
          setBusiness(bizRes.data)
        }

        // Calculate initial price
        try {
          const calcRes = await axios.get(`/api/products/${id}/calculate-price?quantity=${prod.moq || 1}`)
          setPriceCalc(calcRes.data)
        } catch { /* ignore */ }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function recalcPrice(qty) {
    if (!qty || qty < 1) { setPriceCalc(null); return }
    try {
      const res = await axios.get(`/api/products/${id}/calculate-price?quantity=${qty}`)
      setPriceCalc(res.data)
    } catch { setPriceCalc(null) }
  }

  async function submitReview() {
    if (!user.id) { alert('Please log in to leave a review.'); return }
    setSubmitting(true)
    try {
      await axios.post('/api/reviews', {
        productId: Number(id),
        reviewerBusinessId: Number(user.id),
        ...reviewForm,
      })
      // Refresh reviews
      const [reviewsRes, summaryRes] = await Promise.all([
        axios.get(`/api/reviews/product/${id}`),
        axios.get(`/api/reviews/product/${id}/summary`),
      ])
      setReviews(reviewsRes.data || [])
      setSummary(summaryRes.data)
      setShowReviewForm(false)
      setReviewForm({ rating: 5, comment: '', qualityRating: 5, valueRating: 5, shippingRating: 5 })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  async function markHelpful(reviewId) {
    try {
      await axios.put(`/api/reviews/${reviewId}/helpful`)
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    } catch { /* ignore */ }
  }

  async function filterByRating(rating) {
    if (filterRating === rating) {
      setFilterRating(null)
      const res = await axios.get(`/api/reviews/product/${id}`)
      setReviews(res.data || [])
    } else {
      setFilterRating(rating)
      const res = await axios.get(`/api/reviews/product/${id}/filter?rating=${rating}`)
      setReviews(res.data || [])
    }
  }

  const dist = summary.distribution || {}
  const totalForBar = summary.totalReviews || 1

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .6s linear infinite', margin: '0 auto 16px' }}></div>
        <div style={{ color: 'var(--muted)' }}>Loading product...</div>
      </div>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
        <div>Product not found</div>
        <Link to="/marketplace" style={{ color: 'var(--accent)', marginTop: 12, display: 'inline-block' }}>Back to Marketplace</Link>
      </div>
    </div>
  )

  const icon = getIcon(product.name, product.category)
  const bizInitials = (business?.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const stockStatus = product.stock > 100 ? 'In Stock' : product.stock > 10 ? 'Limited' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'
  const stockColor = product.stock > 100 ? '#16a34a' : product.stock > 10 ? '#d97706' : product.stock > 0 ? '#dc2626' : '#6b7280'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pd-topbar{background:var(--green);height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:100;box-shadow:0 2px 10px rgba(20,83,45,.18);}
        .pd-brand{display:flex;align-items:center;gap:10px;}
        .pd-logo{width:30px;height:30px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:7px;display:flex;align-items:center;justify-content:center;}
        .pd-brand-name{font-family:'DM Serif Display',serif;font-size:1rem;color:#fff;}
        .pd-brand-name b{color:#86efac;font-weight:400;}
        .pd-topnav{display:flex;gap:2px;}
        .pd-topnav a{padding:6px 12px;border-radius:6px;font-size:.84rem;font-weight:500;color:rgba(255,255,255,.6);text-decoration:none;transition:all .18s;display:flex;align-items:center;gap:5px;}
        .pd-topnav a:hover{background:rgba(255,255,255,.08);color:#fff;}
        .pd-topnav a.act{background:rgba(255,255,255,.12);color:#fff;}
        .pd-topright{display:flex;align-items:center;gap:10px;}
        .pd-chip{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:5px 10px 5px 7px;}
        .pd-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#0d9488);display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;}
        .pd-chip-name{font-size:.82rem;font-weight:500;color:rgba(255,255,255,.85);}
        .pd-breadcrumb{padding:14px 32px;font-size:.82rem;color:var(--muted);display:flex;align-items:center;gap:6px;border-bottom:1px solid var(--border);background:var(--surface);}
        .pd-breadcrumb a{color:var(--accent);text-decoration:none;}
        .pd-breadcrumb a:hover{text-decoration:underline;}
        .pd-main{max-width:1280px;margin:0 auto;padding:28px 32px 60px;width:100%;box-sizing:border-box;}
        .pd-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:36px;animation:fadeUp .35s ease both;}
        .pd-gallery{background:var(--surface);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;}
        .pd-img-main{height:340px;background:linear-gradient(135deg,var(--bg) 0%,#e8f5e9 100%);display:flex;align-items:center;justify-content:center;font-size:6rem;position:relative;}
        .pd-img-main img{max-height:100%;max-width:100%;object-fit:contain;}
        .pd-stock-badge{position:absolute;top:14px;right:14px;padding:4px 12px;border-radius:20px;font-size:.73rem;font-weight:600;color:#fff;}
        .pd-cat-badge{position:absolute;top:14px;left:14px;padding:4px 12px;border-radius:20px;font-size:.73rem;font-weight:600;background:var(--green);color:#fff;}
        .pd-thumbs{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border);}
        .pd-thumb{width:56px;height:56px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:1.5rem;border:2px solid transparent;cursor:pointer;transition:all .18s;}
        .pd-thumb.act{border-color:var(--accent);}
        .pd-info{display:flex;flex-direction:column;gap:18px;}
        .pd-seller{display:flex;align-items:center;gap:12px;padding:14px 18px;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;}
        .pd-seller-avatar{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--teal));display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:#fff;flex-shrink:0;}
        .pd-seller-info{flex:1;}
        .pd-seller-name{font-size:.88rem;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px;}
        .pd-verified{display:inline-flex;align-items:center;gap:3px;font-size:.7rem;color:var(--accent);font-weight:600;}
        .pd-seller-meta{font-size:.76rem;color:var(--muted);margin-top:2px;}
        .pd-title{font-family:'DM Serif Display',serif;font-size:1.5rem;color:var(--text);line-height:1.3;}
        .pd-sku{font-size:.78rem;color:var(--muted);}
        .pd-rating-row{display:flex;align-items:center;gap:10px;}
        .pd-rating-val{font-size:1.1rem;font-weight:700;color:var(--text);}
        .pd-rating-count{font-size:.82rem;color:var(--muted);}
        .pd-price-box{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:20px;}
        .pd-price{font-family:'DM Serif Display',serif;font-size:1.8rem;color:var(--green);}
        .pd-price-unit{font-size:.82rem;color:var(--muted);font-family:'DM Sans',sans-serif;font-weight:400;}
        .pd-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}
        .pd-meta-item{padding:10px 14px;background:var(--bg);border-radius:8px;}
        .pd-meta-label{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;}
        .pd-meta-val{font-size:.9rem;font-weight:600;color:var(--text);}
        .pd-tiers{margin-top:14px;}
        .pd-tier{display:flex;justify-content:space-between;padding:8px 12px;border-radius:6px;font-size:.8rem;margin-bottom:3px;background:var(--bg);}
        .pd-tier.active{background:var(--light);border:1px solid var(--accent);}
        .pd-order-box{display:flex;gap:10px;margin-top:16px;}
        .pd-qty-input{width:100px;padding:10px 14px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.88rem;outline:none;background:var(--surface);color:var(--text);}
        .pd-qty-input:focus{border-color:var(--accent);}
        .pd-buy-btn{flex:1;padding:12px;background:var(--green);color:#fff;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px;}
        .pd-buy-btn:hover{background:var(--green2);box-shadow:0 4px 14px rgba(20,83,45,.2);}
        .pd-rfq-btn{padding:12px 20px;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;color:var(--text);cursor:pointer;transition:all .18s;}
        .pd-rfq-btn:hover{border-color:var(--accent);color:var(--accent);}
        .pd-calc{display:flex;justify-content:space-between;padding:10px 14px;background:var(--light);border-radius:8px;margin-top:10px;}
        .pd-calc-label{font-size:.82rem;color:var(--muted);}
        .pd-calc-val{font-size:1rem;font-weight:700;color:var(--green);}

        .pd-tabs{display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:24px;animation:fadeUp .35s ease both .1s;}
        .pd-tab{padding:12px 24px;font-size:.9rem;font-weight:600;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .18s;}
        .pd-tab:hover{color:var(--text);}
        .pd-tab.act{color:var(--green);border-bottom-color:var(--green);}
        .pd-tab-count{font-size:.75rem;font-weight:700;background:var(--accent);color:#fff;border-radius:10px;padding:1px 7px;margin-left:6px;}

        .rv-summary{display:grid;grid-template-columns:200px 1fr;gap:32px;margin-bottom:28px;padding:24px;background:var(--surface);border:1.5px solid var(--border);border-radius:14px;animation:fadeUp .35s ease both .15s;}
        .rv-avg{text-align:center;}
        .rv-avg-num{font-family:'DM Serif Display',serif;font-size:3rem;color:var(--text);line-height:1;}
        .rv-avg-label{font-size:.82rem;color:var(--muted);margin-top:6px;}
        .rv-bars{display:flex;flex-direction:column;gap:6px;justify-content:center;}
        .rv-bar-row{display:flex;align-items:center;gap:10px;cursor:pointer;padding:3px 6px;border-radius:6px;transition:background .15s;}
        .rv-bar-row:hover{background:var(--bg);}
        .rv-bar-row.act{background:var(--light);}
        .rv-bar-label{font-size:.82rem;font-weight:600;color:var(--text);width:14px;text-align:right;}
        .rv-bar-track{flex:1;height:10px;background:var(--bg);border-radius:5px;overflow:hidden;}
        .rv-bar-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,#f59e0b,#eab308);transition:width .4s ease;}
        .rv-bar-count{font-size:.78rem;color:var(--muted);width:30px;}

        .rv-actions{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
        .rv-filters{display:flex;gap:6px;}
        .rv-filter{padding:6px 14px;border-radius:20px;font-size:.8rem;font-weight:500;border:1.5px solid var(--border);background:var(--surface);color:var(--muted);cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;}
        .rv-filter:hover{border-color:var(--accent);color:var(--text);}
        .rv-filter.act{background:var(--green);color:#fff;border-color:var(--green);}
        .rv-write-btn{padding:10px 20px;background:var(--green);color:#fff;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:6px;}
        .rv-write-btn:hover{background:var(--green2);}

        .rv-card{padding:20px;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;margin-bottom:14px;animation:fadeUp .3s ease both;}
        .rv-card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
        .rv-reviewer{display:flex;align-items:center;gap:10px;}
        .rv-reviewer-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;}
        .rv-reviewer-name{font-size:.88rem;font-weight:600;color:var(--text);}
        .rv-reviewer-badges{display:flex;gap:6px;margin-top:2px;}
        .rv-badge{font-size:.68rem;font-weight:600;padding:2px 8px;border-radius:4px;}
        .rv-badge.verified{background:#dcfce7;color:#16a34a;}
        .rv-badge.repeat{background:#fef3c7;color:#d97706;}
        .rv-date{font-size:.78rem;color:var(--muted);}
        .rv-comment{font-size:.88rem;color:var(--text);line-height:1.6;margin:10px 0;}
        .rv-sub-ratings{display:flex;gap:18px;margin:10px 0;flex-wrap:wrap;}
        .rv-sub{font-size:.78rem;color:var(--muted);display:flex;align-items:center;gap:4px;}
        .rv-sub b{color:var(--text);}
        .rv-helpful{display:flex;align-items:center;gap:6px;margin-top:8px;}
        .rv-helpful-btn{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:none;font-family:'DM Sans',sans-serif;font-size:.77rem;color:var(--muted);cursor:pointer;transition:all .15s;}
        .rv-helpful-btn:hover{border-color:var(--accent);color:var(--accent);}
        .rv-seller-reply{margin-top:12px;padding:12px 16px;background:var(--bg);border-radius:10px;border-left:3px solid var(--accent);}
        .rv-seller-reply-head{font-size:.78rem;font-weight:600;color:var(--accent);margin-bottom:4px;display:flex;align-items:center;gap:6px;}
        .rv-seller-reply-text{font-size:.84rem;color:var(--text);line-height:1.5;}

        .rv-form{padding:24px;background:var(--surface);border:1.5px solid var(--accent);border-radius:14px;margin-bottom:20px;animation:fadeUp .25s ease both;}
        .rv-form-title{font-family:'DM Serif Display',serif;font-size:1.1rem;color:var(--text);margin-bottom:16px;}
        .rv-form-field{margin-bottom:16px;}
        .rv-form-label{display:block;font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:6px;}
        .rv-star-picker{display:flex;gap:4px;}
        .rv-star-btn{width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .rv-star-btn:hover{border-color:#f59e0b;}
        .rv-star-btn.act{background:#fef3c7;border-color:#f59e0b;}
        .rv-textarea{width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.88rem;outline:none;background:var(--bg);color:var(--text);resize:vertical;min-height:100px;box-sizing:border-box;}
        .rv-textarea:focus{border-color:var(--accent);}
        .rv-sub-row{display:flex;gap:20px;flex-wrap:wrap;}
        .rv-sub-field{display:flex;align-items:center;gap:8px;}
        .rv-sub-field label{font-size:.8rem;color:var(--muted);white-space:nowrap;}
        .rv-form-btns{display:flex;gap:10px;margin-top:18px;}
        .rv-form-btns button{padding:10px 20px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;}
        .rv-empty{text-align:center;padding:48px 20px;color:var(--muted);}

        @media(max-width:900px){.pd-grid{grid-template-columns:1fr;} .rv-summary{grid-template-columns:1fr;}}
      `}</style>

      {/* TOPBAR */}
      <header className="pd-topbar">
        <div className="pd-brand">
          <div className="pd-logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /><circle cx="20" cy="18" r="2.5" fill="#fff" /></svg></div>
          <div className="pd-brand-name">Stock<b>Bridge</b></div>
        </div>
        <nav className="pd-topnav">
          <Link to="/"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>Home</Link>
          <Link to="/dashboard"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>Dashboard</Link>
          <Link to="/marketplace" className="act"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>Marketplace</Link>
          <Link to="/orders">Orders</Link>
        </nav>
        <div className="pd-topright">
          <div className="pd-chip"><div className="pd-avatar">{initials}</div><span className="pd-chip-name">{user.businessName || 'User'}</span></div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="pd-breadcrumb">
        <Link to="/marketplace">Marketplace</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        {product.category && <><Link to="/marketplace">{product.category}</Link><span style={{ color: 'var(--border)' }}>/</span></>}
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{product.name}</span>
      </div>

      <div className="pd-main">
        {/* PRODUCT TOP SECTION */}
        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-img-main">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="font-size:6rem">${icon}</span>` }} />
                : <span>{icon}</span>
              }
              <div className="pd-cat-badge">{product.category || 'General'}</div>
              <div className="pd-stock-badge" style={{ background: stockColor }}>{stockStatus}</div>
            </div>
            <div className="pd-thumbs">
              <div className={`pd-thumb${selectedImg === 0 ? ' act' : ''}`} onClick={() => setSelectedImg(0)}>{product.imageUrl ? '🖼️' : icon}</div>
              <div className={`pd-thumb${selectedImg === 1 ? ' act' : ''}`} onClick={() => setSelectedImg(1)}>📐</div>
              <div className={`pd-thumb${selectedImg === 2 ? ' act' : ''}`} onClick={() => setSelectedImg(2)}>📦</div>
            </div>
          </div>

          {/* Product Info */}
          <div className="pd-info">
            {/* Seller */}
            <div className="pd-seller">
              <div className="pd-seller-avatar">{bizInitials}</div>
              <div className="pd-seller-info">
                <div className="pd-seller-name">
                  {business?.name || 'Supplier'}
                  <span className="pd-verified"><svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" stroke="#fff" strokeWidth="2.5" /></svg>Verified</span>
                </div>
                <div className="pd-seller-meta">
                  {business?.businessType || 'Wholesale'} · {business?.city || 'Global'}
                  {business?.phone && ` · ${business.phone}`}
                </div>
              </div>
              <Link to="/marketplace" style={{ fontSize: '.78rem', color: 'var(--accent)', textDecoration: 'none' }}>View Store</Link>
            </div>

            {/* Title & SKU */}
            <div>
              <h1 className="pd-title">{product.name}</h1>
              {product.sku && <div className="pd-sku">SKU: {product.sku}</div>}
              {product.description && <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{product.description}</p>}
            </div>

            {/* Rating summary */}
            <div className="pd-rating-row">
              <span className="pd-rating-val">{summary.averageRating || '0.0'}</span>
              <Stars rating={Math.round(summary.averageRating || 0)} size={18} />
              <span className="pd-rating-count">({summary.totalReviews || 0} reviews)</span>
            </div>

            {/* Price Box */}
            <div className="pd-price-box">
              <div className="pd-price">
                ${Number(product.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="pd-price-unit"> / {product.unit || 'piece'}</span>
              </div>
              <div className="pd-meta-grid">
                <div className="pd-meta-item"><div className="pd-meta-label">Min. Order</div><div className="pd-meta-val">{product.moq || 1} {product.unit || 'piece'}s</div></div>
                <div className="pd-meta-item"><div className="pd-meta-label">Available Stock</div><div className="pd-meta-val">{(product.stock || 0).toLocaleString()} {product.unit || 'piece'}s</div></div>
                <div className="pd-meta-item"><div className="pd-meta-label">Category</div><div className="pd-meta-val">{product.category || 'General'}</div></div>
                <div className="pd-meta-item"><div className="pd-meta-label">Unit</div><div className="pd-meta-val" style={{ textTransform: 'capitalize' }}>{product.unit || 'piece'}</div></div>
              </div>

              {/* Bulk Pricing Tiers */}
              {bulkPricing.length > 0 && (
                <div className="pd-tiers">
                  <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Bulk Pricing Tiers</div>
                  {bulkPricing.filter(t => t.isActive !== false).map((tier, i) => (
                    <div key={i} className={`pd-tier${priceCalc?.appliedTier === tier.id ? ' active' : ''}`}>
                      <span style={{ color: 'var(--muted)' }}>{tier.minQuantity}{tier.maxQuantity ? `–${tier.maxQuantity}` : '+'} units</span>
                      <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                        {tier.discountPercent ? `${tier.discountPercent}% off` : ''}
                        {tier.tierPrice ? ` $${Number(tier.tierPrice).toFixed(2)}/unit` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Section */}
              <div className="pd-order-box">
                <input
                  className="pd-qty-input"
                  type="number"
                  min={product.moq || 1}
                  max={product.stock || 99999}
                  value={buyQty}
                  onChange={e => { setBuyQty(e.target.value); const q = Number(e.target.value); if (q >= (product.moq || 1)) recalcPrice(q) }}
                  placeholder={`Min ${product.moq || 1}`}
                />
                <button className="pd-buy-btn" onClick={() => {
                  const qty = Number(buyQty)
                  if (qty < (product.moq || 1)) { alert(`Minimum order: ${product.moq || 1} ${product.unit || 'piece'}s`); return }
                  // Navigate to marketplace with item ready to buy (or add to cart logic)
                  navigate(`/marketplace?buy=${product.id}&qty=${qty}`)
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                  Start Order
                </button>
                <button className="pd-rfq-btn" onClick={() => navigate(`/marketplace?rfq=${product.id}`)}>Request Quote</button>
              </div>

              {/* Price Calculation */}
              {priceCalc && Number(buyQty) >= (product.moq || 1) && (
                <>
                  {priceCalc.discountPercent > 0 && (
                    <div className="pd-calc">
                      <span className="pd-calc-label">Discount</span>
                      <span style={{ color: '#d97706', fontWeight: 600, fontSize: '.88rem' }}>{priceCalc.discountPercent}% off — Save ${Number(priceCalc.totalSavings || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pd-calc">
                    <span className="pd-calc-label">Total ({buyQty} {product.unit || 'piece'}s)</span>
                    <span className="pd-calc-val">${Number(priceCalc.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="pd-tabs">
          <div className={`pd-tab${activeTab === 'reviews' ? ' act' : ''}`} onClick={() => setActiveTab('reviews')}>
            Product Reviews <span className="pd-tab-count">{summary.totalReviews || 0}</span>
          </div>
          <div className={`pd-tab${activeTab === 'store' ? ' act' : ''}`} onClick={() => setActiveTab('store')}>
            Store Reviews
          </div>
        </div>

        {activeTab === 'reviews' && (
          <>
            {/* RATING SUMMARY */}
            <div className="rv-summary">
              <div className="rv-avg">
                <div className="rv-avg-num">{summary.averageRating || '0.0'}</div>
                <Stars rating={Math.round(summary.averageRating || 0)} size={20} />
                <div className="rv-avg-label" style={{ marginTop: 8 }}>
                  {summary.averageRating >= 4.5 ? 'Very satisfied' : summary.averageRating >= 3.5 ? 'Satisfied' : summary.averageRating >= 2.5 ? 'Average' : summary.totalReviews > 0 ? 'Below average' : 'No reviews yet'}
                </div>
                <div className="rv-avg-label">Based on {summary.totalReviews || 0} reviews</div>
              </div>
              <div className="rv-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = dist[star] || 0
                  const pct = totalForBar > 0 ? (count / totalForBar) * 100 : 0
                  return (
                    <div key={star} className={`rv-bar-row${filterRating === star ? ' act' : ''}`} onClick={() => filterByRating(star)}>
                      <span className="rv-bar-label">{star}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <div className="rv-bar-track"><div className="rv-bar-fill" style={{ width: `${pct}%` }}></div></div>
                      <span className="rv-bar-count">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="rv-actions">
              <div className="rv-filters">
                <button className={`rv-filter${!filterRating ? ' act' : ''}`} onClick={() => { setFilterRating(null); axios.get(`/api/reviews/product/${id}`).then(r => setReviews(r.data || [])) }}>All</button>
                {[5, 4, 3, 2, 1].map(s => (
                  <button key={s} className={`rv-filter${filterRating === s ? ' act' : ''}`} onClick={() => filterByRating(s)}>
                    {s} <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  </button>
                ))}
              </div>
              <button className="rv-write-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Write a Review
              </button>
            </div>

            {/* REVIEW FORM */}
            {showReviewForm && (
              <div className="rv-form">
                <div className="rv-form-title">Write Your Review</div>
                <div className="rv-form-field">
                  <label className="rv-form-label">Overall Rating</label>
                  <div className="rv-star-picker">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} className={`rv-star-btn${reviewForm.rating >= s ? ' act' : ''}`} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={reviewForm.rating >= s ? '#f59e0b' : 'none'} stroke={reviewForm.rating >= s ? '#f59e0b' : '#d1d5db'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </button>
                    ))}
                    <span style={{ marginLeft: 8, fontSize: '.86rem', fontWeight: 600, color: 'var(--text)' }}>{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}</span>
                  </div>
                </div>

                <div className="rv-form-field">
                  <label className="rv-form-label">Sub-Ratings</label>
                  <div className="rv-sub-row">
                    {[{ key: 'qualityRating', label: 'Quality' }, { key: 'valueRating', label: 'Value' }, { key: 'shippingRating', label: 'Shipping' }].map(({ key, label }) => (
                      <div key={key} className="rv-sub-field">
                        <label>{label}:</label>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={reviewForm[key] >= s ? '#f59e0b' : 'none'} stroke={reviewForm[key] >= s ? '#f59e0b' : '#d1d5db'} strokeWidth="2" style={{ cursor: 'pointer' }}
                              onClick={() => setReviewForm(p => ({ ...p, [key]: s }))}>
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rv-form-field">
                  <label className="rv-form-label">Your Review</label>
                  <textarea className="rv-textarea" placeholder="Share your experience with this product — quality, packing, delivery, communication with seller..." value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
                </div>

                <div className="rv-form-btns">
                  <button onClick={() => setShowReviewForm(false)} style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
                  <button onClick={submitReview} disabled={submitting} style={{ background: 'var(--green)', border: 'none', color: '#fff', opacity: submitting ? .7 : 1 }}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {/* REVIEW LIST */}
            {reviews.length === 0 ? (
              <div className="rv-empty">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: '.9rem' }}>No reviews yet. Be the first to review this product!</div>
              </div>
            ) : (
              reviews.map((r, i) => {
                const rInitials = (r.reviewerName || r.reviewerBusiness?.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                const maskedName = (r.reviewerName || 'Anonymous').charAt(0) + '***' + (r.reviewerName || 'Anonymous').slice(-1)
                return (
                  <div key={r.id || i} className="rv-card" style={{ animationDelay: `${i * .05}s` }}>
                    <div className="rv-card-head">
                      <div className="rv-reviewer">
                        <div className="rv-reviewer-avatar">{rInitials}</div>
                        <div>
                          <div className="rv-reviewer-name">{maskedName}</div>
                          <div className="rv-reviewer-badges">
                            {r.isVerifiedPurchase && <span className="rv-badge verified">Verified purchase</span>}
                          </div>
                        </div>
                      </div>
                      <div className="rv-date"><TimeAgo date={r.createdAt} /></div>
                    </div>
                    <Stars rating={r.rating} size={16} />
                    {r.comment && <div className="rv-comment">{r.comment}</div>}
                    {(r.qualityRating || r.valueRating || r.shippingRating) && (
                      <div className="rv-sub-ratings">
                        {r.qualityRating && <span className="rv-sub">Quality: <b>{r.qualityRating}/5</b></span>}
                        {r.valueRating && <span className="rv-sub">Value: <b>{r.valueRating}/5</b></span>}
                        {r.shippingRating && <span className="rv-sub">Shipping: <b>{r.shippingRating}/5</b></span>}
                      </div>
                    )}
                    <div className="rv-helpful">
                      <button className="rv-helpful-btn" onClick={() => markHelpful(r.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                        Helpful ({r.helpfulCount || 0})
                      </button>
                    </div>
                    {r.sellerResponse && (
                      <div className="rv-seller-reply">
                        <div className="rv-seller-reply-head">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                          Seller Response
                        </div>
                        <div className="rv-seller-reply-text">{r.sellerResponse}</div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </>
        )}

        {activeTab === 'store' && (
          <div className="rv-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏪</div>
            <div style={{ fontSize: '.9rem' }}>Store reviews coming soon.</div>
          </div>
        )}
      </div>
    </div>
  )
}
