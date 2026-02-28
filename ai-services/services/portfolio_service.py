"""
Portfolio HTML generator — two themes:
  - "minimal"  : editorial dark-on-cream, Playfair Display + DM Sans
  - "modern"   : vibrant dark glass, Space Grotesk + Inter (only exception — fits the sci-fi vibe)
"""

from jinja2 import Environment, BaseLoader


MINIMAL_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{{ name }} — Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
  :root{--ink:#1a1714;--muted:#7a736a;--line:#e8e2d9;--bg:#faf7f2;--accent:#2d4a3e;--accent2:#c4722a;}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:var(--bg);color:var(--ink);font-family:'DM Sans',sans-serif;font-weight:300;line-height:1.7;-webkit-font-smoothing:antialiased;}
  .container{max-width:780px;margin:0 auto;padding:0 2rem;}

  /* NAV */
  nav{position:fixed;top:0;width:100%;z-index:99;padding:1.25rem 2rem;display:flex;justify-content:space-between;align-items:center;background:rgba(250,247,242,0.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);}
  .nav-brand{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--ink);text-decoration:none;}
  .nav-links{display:flex;gap:2rem;}
  .nav-links a{font-size:.825rem;color:var(--muted);text-decoration:none;letter-spacing:.04em;text-transform:uppercase;transition:color .2s;}
  .nav-links a:hover{color:var(--ink);}

  /* HERO */
  .hero{min-height:100vh;display:flex;align-items:center;padding:7rem 0 5rem;}
  .hero-inner{display:grid;grid-template-columns:1fr auto;gap:4rem;align-items:end;}
  .hero-tag{font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:500;margin-bottom:1.5rem;display:flex;align-items:center;gap:.5rem;}
  .hero-tag::before{content:'';display:block;width:2rem;height:1px;background:var(--accent);}
  h1{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,6vw,4.5rem);line-height:1.08;font-weight:700;letter-spacing:-.02em;margin-bottom:1.5rem;}
  h1 em{font-style:italic;color:var(--accent);}
  .hero-summary{font-size:1.05rem;color:var(--muted);max-width:480px;line-height:1.8;margin-bottom:2.5rem;}
  .hero-contact{display:flex;flex-wrap:wrap;gap:.75rem;}
  .hero-contact a{font-size:.825rem;color:var(--muted);text-decoration:none;border:1px solid var(--line);padding:.4rem 1rem;border-radius:2rem;transition:all .2s;}
  .hero-contact a:hover{color:var(--accent);border-color:var(--accent);}
  .hero-number{font-family:'Playfair Display',serif;font-size:5rem;font-weight:700;color:var(--line);line-height:1;writing-mode:vertical-rl;text-orientation:mixed;letter-spacing:-.04em;user-select:none;}

  /* DIVIDER */
  .divider{border:none;border-top:1px solid var(--line);margin:0;}

  /* SECTIONS */
  section{padding:5rem 0;}
  .section-label{font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);font-weight:500;margin-bottom:3rem;display:flex;align-items:center;gap:.75rem;}
  .section-label::after{content:'';flex:1;height:1px;background:var(--line);}
  h2{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;margin-bottom:2.5rem;letter-spacing:-.02em;}

  /* SKILLS */
  .skills-grid{display:flex;flex-wrap:wrap;gap:.6rem;}
  .skill-tag{font-size:.8rem;font-weight:500;padding:.4rem 1.1rem;border:1px solid var(--line);border-radius:2rem;background:white;color:var(--ink);transition:all .2s;}
  .skill-tag:hover{border-color:var(--accent);color:var(--accent);}

  /* EXPERIENCE */
  .exp-item{display:grid;grid-template-columns:1fr auto;gap:1rem;padding:2rem 0;border-bottom:1px solid var(--line);}
  .exp-item:first-child{border-top:1px solid var(--line);}
  .exp-role{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin-bottom:.25rem;}
  .exp-company{font-size:.9rem;color:var(--accent);font-weight:500;}
  .exp-duration{font-size:.8rem;color:var(--muted);font-weight:400;text-align:right;white-space:nowrap;margin-top:.25rem;}
  .exp-bullets{margin-top:.75rem;padding-left:1.2rem;color:var(--muted);font-size:.9rem;}
  .exp-bullets li{margin-bottom:.3rem;}

  /* PROJECTS */
  .projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem;}
  .project-card{background:white;border:1px solid var(--line);border-radius:1rem;padding:1.75rem;transition:all .25s;position:relative;overflow:hidden;}
  .project-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--accent);transform:scaleY(0);transform-origin:top;transition:transform .25s;}
  .project-card:hover{box-shadow:0 8px 32px rgba(0,0,0,.06);transform:translateY(-2px);}
  .project-card:hover::before{transform:scaleY(1);}
  .project-title{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;margin-bottom:.75rem;}
  .project-desc{font-size:.875rem;color:var(--muted);line-height:1.65;}

  /* EDUCATION */
  .edu-item{display:grid;grid-template-columns:1fr auto;gap:1rem;padding:1.75rem 0;border-bottom:1px solid var(--line);}
  .edu-item:first-child{border-top:1px solid var(--line);}
  .edu-degree{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;}
  .edu-inst{font-size:.875rem;color:var(--muted);margin-top:.2rem;}
  .edu-year{font-size:.85rem;color:var(--accent);font-weight:500;}

  /* FOOTER */
  footer{padding:3rem 0;border-top:1px solid var(--line);}
  .footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;}
  .footer-brand{font-family:'Playfair Display',serif;font-size:.9rem;color:var(--muted);}
  .footer-hs{font-size:.75rem;color:var(--line);letter-spacing:.08em;}

  /* ANIMATIONS */
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  .fade-up{animation:fadeUp .7s ease-out forwards;}
  .delay-1{animation-delay:.1s;opacity:0;}
  .delay-2{animation-delay:.22s;opacity:0;}
  .delay-3{animation-delay:.35s;opacity:0;}

  /* RESPONSIVE */
  @media(max-width:640px){.hero-inner{grid-template-columns:1fr;}.hero-number{display:none;}.projects-grid{grid-template-columns:1fr;}}
</style>
</head>
<body>

<nav>
  <a href="#" class="nav-brand">{{ name.split()[0] if name else 'Portfolio' }}</a>
  <div class="nav-links">
    {% if skills %}<a href="#skills">Skills</a>{% endif %}
    {% if experience %}<a href="#experience">Experience</a>{% endif %}
    {% if projects %}<a href="#projects">Projects</a>{% endif %}
    {% if education %}<a href="#education">Education</a>{% endif %}
  </div>
</nav>

<div class="container">

  <section class="hero">
    <div class="hero-inner">
      <div>
        <div class="hero-tag fade-up">Available for opportunities</div>
        <h1 class="fade-up delay-1">{{ name.split()[0] if name else '' }}<br/><em>{{ name.split()[1] if name and name.split()|length > 1 else '' }}</em></h1>
        {% if summary %}
        <p class="hero-summary fade-up delay-2">{{ summary }}</p>
        {% endif %}
        <div class="hero-contact fade-up delay-3">
          {% if email %}<a href="mailto:{{ email }}">✉ {{ email }}</a>{% endif %}
          {% if phone %}<a href="tel:{{ phone }}">✆ {{ phone }}</a>{% endif %}
          {% if linkedin %}<a href="{{ linkedin }}" target="_blank">LinkedIn ↗</a>{% endif %}
          {% if github %}<a href="{{ github }}" target="_blank">GitHub ↗</a>{% endif %}
          {% if website %}<a href="{{ website }}" target="_blank">Website ↗</a>{% endif %}
        </div>
      </div>
      <div class="hero-number" aria-hidden="true">{{ name.split()[0][0] if name else 'P' }}</div>
    </div>
  </section>

  <hr class="divider"/>

  {% if skills %}
  <section id="skills">
    <div class="section-label">Technical skills</div>
    <div class="skills-grid">
      {% for skill in skills %}
      <span class="skill-tag">{{ skill }}</span>
      {% endfor %}
    </div>
  </section>
  <hr class="divider"/>
  {% endif %}

  {% if experience %}
  <section id="experience">
    <div class="section-label">Work experience</div>
    {% for exp in experience %}
    <div class="exp-item">
      <div>
        <div class="exp-role">{{ exp.role }}</div>
        <div class="exp-company">{{ exp.company }}</div>
        {% if exp.bullets %}
        <ul class="exp-bullets">
          {% for b in exp.bullets %}<li>{{ b }}</li>{% endfor %}
        </ul>
        {% endif %}
      </div>
      <div class="exp-duration">{{ exp.duration }}</div>
    </div>
    {% endfor %}
  </section>
  <hr class="divider"/>
  {% endif %}

  {% if projects %}
  <section id="projects">
    <div class="section-label">Selected projects</div>
    <div class="projects-grid">
      {% for p in projects %}
      <div class="project-card">
        <div class="project-title">{{ p.title }}</div>
        <div class="project-desc">{{ p.description }}</div>
      </div>
      {% endfor %}
    </div>
  </section>
  <hr class="divider"/>
  {% endif %}

  {% if education %}
  <section id="education">
    <div class="section-label">Education</div>
    {% for edu in education %}
    <div class="edu-item">
      <div>
        <div class="edu-degree">{{ edu.degree }}</div>
        <div class="edu-inst">{{ edu.institution }}</div>
      </div>
      <div class="edu-year">{{ edu.year }}</div>
    </div>
    {% endfor %}
  </section>
  {% endif %}

</div>

<footer>
  <div class="container">
    <div class="footer-inner">
      <span class="footer-brand">{{ name }} &mdash; Portfolio</span>
      <span class="footer-hs">Generated by HireSense · hiresense.ai/portfolio/{{ username }}</span>
    </div>
  </div>
</footer>

</body>
</html>"""


MODERN_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{{ name }} — Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
  :root{--bg:#080b14;--surface:#0e1220;--surface2:#141828;--border:rgba(255,255,255,0.07);--text:#e8ecf4;--muted:#6b7694;--accent:#7c6dfa;--accent2:#fa6d8c;--green:#4dffa8;}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:var(--bg);color:var(--text);font-family:'Outfit',sans-serif;font-weight:300;line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden;}

  /* NOISE TEXTURE */
  body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:.4;}

  .container{max-width:1100px;margin:0 auto;padding:0 2rem;position:relative;z-index:1;}

  /* GRADIENT BLOBS */
  .blob{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0;}
  .blob-1{width:600px;height:600px;top:-200px;left:-200px;background:radial-gradient(circle,rgba(124,109,250,0.12) 0%,transparent 70%);}
  .blob-2{width:500px;height:500px;bottom:-100px;right:-100px;background:radial-gradient(circle,rgba(250,109,140,0.1) 0%,transparent 70%);}
  .blob-3{width:400px;height:400px;top:40%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(77,255,168,0.05) 0%,transparent 70%);}

  /* NAV */
  nav{position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:99;display:flex;align-items:center;gap:0;background:rgba(14,18,32,0.7);backdrop-filter:blur(20px);border:1px solid var(--border);border-radius:3rem;padding:.5rem .75rem;box-shadow:0 8px 32px rgba(0,0,0,.4);}
  .nav-brand{font-family:'Syne',sans-serif;font-weight:800;font-size:.9rem;color:var(--text);padding:.35rem .9rem;margin-right:.5rem;border-right:1px solid var(--border);}
  .nav-links{display:flex;gap:.25rem;}
  .nav-links a{font-size:.78rem;color:var(--muted);text-decoration:none;padding:.35rem .9rem;border-radius:2rem;transition:all .2s;font-weight:500;}
  .nav-links a:hover{color:var(--text);background:rgba(255,255,255,0.06);}

  /* HERO */
  .hero{min-height:100vh;display:flex;align-items:center;padding:8rem 0 5rem;position:relative;}
  .hero-badge{display:inline-flex;align-items:center;gap:.5rem;font-size:.75rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--green);background:rgba(77,255,168,0.08);border:1px solid rgba(77,255,168,0.2);padding:.4rem 1rem;border-radius:2rem;margin-bottom:2rem;}
  .hero-badge span{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
  h1{font-family:'Syne',sans-serif;font-size:clamp(3rem,7vw,5.5rem);font-weight:800;line-height:1.02;letter-spacing:-.03em;margin-bottom:1.75rem;}
  .gradient-text{background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 50%,var(--green) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .hero-sub{font-size:1.1rem;color:var(--muted);max-width:520px;line-height:1.8;margin-bottom:2.5rem;font-weight:300;}
  .hero-chips{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:2.5rem;}
  .hero-chip{font-size:.78rem;font-weight:500;color:var(--muted);background:rgba(255,255,255,0.04);border:1px solid var(--border);padding:.35rem .9rem;border-radius:2rem;}
  .hero-cta{display:flex;gap:1rem;flex-wrap:wrap;}
  .btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.8rem 1.75rem;background:linear-gradient(135deg,var(--accent),#9b8eff);color:white;font-weight:600;font-size:.875rem;border-radius:2rem;text-decoration:none;transition:all .25s;box-shadow:0 4px 24px rgba(124,109,250,.35);}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(124,109,250,.5);}
  .btn-outline{display:inline-flex;align-items:center;gap:.5rem;padding:.8rem 1.75rem;background:transparent;color:var(--muted);font-weight:500;font-size:.875rem;border-radius:2rem;text-decoration:none;border:1px solid var(--border);transition:all .25s;}
  .btn-outline:hover{color:var(--text);border-color:rgba(255,255,255,.2);}

  /* SECTION */
  section{padding:6rem 0;position:relative;z-index:1;}
  .section-header{display:flex;align-items:center;gap:1rem;margin-bottom:3.5rem;}
  .section-num{font-family:'Syne',sans-serif;font-size:.75rem;font-weight:700;color:var(--accent);background:rgba(124,109,250,.12);border:1px solid rgba(124,109,250,.2);padding:.25rem .7rem;border-radius:.5rem;}
  .section-title{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-.02em;}

  /* SKILLS */
  .skills-masonry{columns:2;column-gap:1rem;}
  @media(min-width:640px){.skills-masonry{columns:3;}}
  @media(min-width:900px){.skills-masonry{columns:4;}}
  .skill-pill{display:inline-block;width:100%;margin-bottom:.75rem;break-inside:avoid;font-size:.82rem;font-weight:500;color:var(--text);background:var(--surface);border:1px solid var(--border);padding:.65rem 1.1rem;border-radius:.75rem;transition:all .25s;position:relative;overflow:hidden;}
  .skill-pill::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,109,250,.08),transparent);opacity:0;transition:opacity .25s;}
  .skill-pill:hover{border-color:rgba(124,109,250,.35);transform:translateX(4px);}
  .skill-pill:hover::before{opacity:1;}

  /* EXPERIENCE */
  .exp-timeline{position:relative;padding-left:2rem;}
  .exp-timeline::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:1px;background:linear-gradient(to bottom,var(--accent),var(--accent2),transparent);}
  .exp-item{position:relative;padding:0 0 3rem 2rem;}
  .exp-item::before{content:'';position:absolute;left:-2rem;top:6px;width:10px;height:10px;border-radius:50%;background:var(--accent);border:2px solid var(--bg);box-shadow:0 0 0 3px rgba(124,109,250,.25);}
  .exp-meta{display:flex;align-items:baseline;gap:1rem;flex-wrap:wrap;margin-bottom:.5rem;}
  .exp-role{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;}
  .exp-company{font-size:.875rem;color:var(--accent);font-weight:500;}
  .exp-dur{font-size:.78rem;color:var(--muted);margin-left:auto;}
  .exp-bullets{list-style:none;margin-top:.75rem;space-y:.35rem;}
  .exp-bullets li{font-size:.875rem;color:var(--muted);padding-left:1.2rem;position:relative;margin-bottom:.3rem;}
  .exp-bullets li::before{content:'→';position:absolute;left:0;color:var(--accent);font-size:.75rem;}

  /* PROJECTS */
  .projects-bento{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem;}
  .proj-card{background:var(--surface);border:1px solid var(--border);border-radius:1.25rem;padding:1.75rem;transition:all .3s;position:relative;overflow:hidden;}
  .proj-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,109,250,0) 0%,rgba(124,109,250,0.06) 100%);opacity:0;transition:opacity .3s;}
  .proj-card:hover{border-color:rgba(124,109,250,.3);transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.4);}
  .proj-card:hover::after{opacity:1;}
  .proj-icon{width:40px;height:40px;border-radius:.75rem;background:linear-gradient(135deg,rgba(124,109,250,.2),rgba(250,109,140,.15));border:1px solid rgba(124,109,250,.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:1.25rem;}
  .proj-title{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:.6rem;}
  .proj-desc{font-size:.85rem;color:var(--muted);line-height:1.65;}

  /* EDUCATION */
  .edu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;}
  .edu-card{background:var(--surface);border:1px solid var(--border);border-radius:1.25rem;padding:1.75rem;}
  .edu-year-badge{display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--green);background:rgba(77,255,168,.08);border:1px solid rgba(77,255,168,.2);padding:.2rem .7rem;border-radius:1rem;margin-bottom:1rem;}
  .edu-degree{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:.35rem;}
  .edu-inst{font-size:.875rem;color:var(--muted);}

  /* FOOTER */
  footer{padding:3rem 0;border-top:1px solid var(--border);position:relative;z-index:1;}
  .footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;}
  .footer-name{font-family:'Syne',sans-serif;font-weight:700;font-size:.9rem;}
  .footer-hs{font-size:.75rem;color:var(--muted);}

  /* SCROLL ANIMATIONS */
  .reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease-out,transform .7s ease-out;}
  .reveal.visible{opacity:1;transform:translateY(0);}

  @media(max-width:640px){h1{font-size:2.6rem;}.nav-links{display:none;}.skills-masonry{columns:2;}}
</style>
</head>
<body>

<div class="blob blob-1"></div>
<div class="blob blob-2"></div>
<div class="blob blob-3"></div>

<nav>
  <span class="nav-brand">{{ name.split()[0] if name else 'Portfolio' }}</span>
  <div class="nav-links">
    {% if skills %}<a href="#skills">Skills</a>{% endif %}
    {% if experience %}<a href="#exp">Experience</a>{% endif %}
    {% if projects %}<a href="#projects">Projects</a>{% endif %}
    {% if education %}<a href="#edu">Education</a>{% endif %}
  </div>
</nav>

<div class="container">
  <section class="hero">
    <div>
      <div class="hero-badge"><span></span>Open to opportunities</div>
      <h1>{{ name.split()[0] if name else '' }}<br/><span class="gradient-text">{{ name.split()[1:] | join(' ') if name else '' }}</span></h1>
      {% if summary %}
      <p class="hero-sub">{{ summary }}</p>
      {% endif %}
      {% if skills %}
      <div class="hero-chips">
        {% for skill in skills[:6] %}<span class="hero-chip">{{ skill }}</span>{% endfor %}
        {% if skills|length > 6 %}<span class="hero-chip">+{{ skills|length - 6 }} more</span>{% endif %}
      </div>
      {% endif %}
      <div class="hero-cta">
        {% if email %}<a href="mailto:{{ email }}" class="btn-primary">✉ Contact Me</a>{% endif %}
        {% if linkedin %}<a href="{{ linkedin }}" class="btn-outline" target="_blank">LinkedIn ↗</a>{% endif %}
        {% if github %}<a href="{{ github }}" class="btn-outline" target="_blank">GitHub ↗</a>{% endif %}
      </div>
    </div>
  </section>

  {% if skills %}
  <section id="skills">
    <div class="reveal">
      <div class="section-header">
        <span class="section-num">01</span>
        <h2 class="section-title">Technical Skills</h2>
      </div>
      <div class="skills-masonry">
        {% for skill in skills %}
        <div class="skill-pill">{{ skill }}</div>
        {% endfor %}
      </div>
    </div>
  </section>
  {% endif %}

  {% if experience %}
  <section id="exp">
    <div class="reveal">
      <div class="section-header">
        <span class="section-num">02</span>
        <h2 class="section-title">Work Experience</h2>
      </div>
      <div class="exp-timeline">
        {% for exp in experience %}
        <div class="exp-item">
          <div class="exp-meta">
            <span class="exp-role">{{ exp.role }}</span>
            <span class="exp-company">@ {{ exp.company }}</span>
            <span class="exp-dur">{{ exp.duration }}</span>
          </div>
          {% if exp.bullets %}
          <ul class="exp-bullets">{% for b in exp.bullets %}<li>{{ b }}</li>{% endfor %}</ul>
          {% endif %}
        </div>
        {% endfor %}
      </div>
    </div>
  </section>
  {% endif %}

  {% if projects %}
  <section id="projects">
    <div class="reveal">
      <div class="section-header">
        <span class="section-num">03</span>
        <h2 class="section-title">Projects</h2>
      </div>
      <div class="projects-bento">
        {% for p in projects %}
        <div class="proj-card">
          <div class="proj-icon">{% set icons=['⚡','🔭','🛰️','🧠','🔬','🎯','💡','🌐'] %}{{ icons[loop.index0 % 8] }}</div>
          <div class="proj-title">{{ p.title }}</div>
          <div class="proj-desc">{{ p.description }}</div>
        </div>
        {% endfor %}
      </div>
    </div>
  </section>
  {% endif %}

  {% if education %}
  <section id="edu">
    <div class="reveal">
      <div class="section-header">
        <span class="section-num">04</span>
        <h2 class="section-title">Education</h2>
      </div>
      <div class="edu-grid">
        {% for edu in education %}
        <div class="edu-card">
          <div class="edu-year-badge">{{ edu.year }}</div>
          <div class="edu-degree">{{ edu.degree }}</div>
          <div class="edu-inst">{{ edu.institution }}</div>
        </div>
        {% endfor %}
      </div>
    </div>
  </section>
  {% endif %}

</div>

<footer>
  <div class="container">
    <div class="footer-inner">
      <span class="footer-name">{{ name }}</span>
      <span class="footer-hs">hiresense.ai/portfolio/{{ username }} · Generated by HireSense</span>
    </div>
  </div>
</footer>

<script>
const els = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, {threshold: 0.1});
els.forEach(el => obs.observe(el));
</script>

</body>
</html>"""


def generate_portfolio_html(portfolio_data: dict, theme: str = "minimal") -> str:
    template_str = MINIMAL_TEMPLATE if theme == "minimal" else MODERN_TEMPLATE
    env = Environment(loader=BaseLoader())
    tpl = env.from_string(template_str)
    return tpl.render(**portfolio_data)