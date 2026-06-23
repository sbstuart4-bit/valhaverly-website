import FairnessDemo from '@/components/fairness-demo';

export default function FairnessPage() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="/" className="logo">
            Valhaverly
          </a>
          <nav className="nav">
            <a href="/#protect">What We Protect</a>
            <a href="/#platform">Platform</a>
            <a href="/#pricing">Pricing</a>
            <a href="/fairness" className="nav-fairness">
              How Fairness Works
            </a>
            <a href="/demo" className="nav-demo">
              Demo
            </a>
            <a href="/commons" className="nav-demo">
              Commons
            </a>
            <a href="/agent-partners">Agent Partners</a>
            <a href="/early-access" className="btn btn-sm btn-gold">
              Get Early Access
            </a>
          </nav>
          <button className="menu-toggle" aria-label="Open menu" aria-expanded="false">
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      <FairnessDemo />
    </>
  );
}
