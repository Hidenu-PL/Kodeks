import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowLeft, ArrowUpRight, Award, BookOpen, Check, ChevronDown,
  ChevronUp, Copy, FileText, Fingerprint, Gavel, Menu, Search, ShieldAlert,
  Scale, X, Cpu, Layers, Filter,
} from 'lucide-react';
import { ALL_CODEX_BOOKS, CERTYFIKAT_DATA } from './content';

type Article = { id: string; title: string; content: string };
type Section = { id: string; title: string; articles: Article[] };
type Book = {
  id: string; title: string; subtitle: string; partTitle: string;
  footerText: string; sections: Section[]; introNote?: string;
};

const books = ALL_CODEX_BOOKS as Book[];
const navItems = [
  { id: 'home', label: 'Strona główna', icon: Scale, number: '00' },
  { id: 'ksiega1', label: 'Kodeks AI (Księga I)', icon: BookOpen, number: '01' },
  { id: 'ksiega2', label: 'Karny AI (Księga II)', icon: ShieldAlert, number: '02' },
  { id: 'ksiega3', label: 'Postępowanie (Księga III)', icon: Gavel, number: '03' },
  { id: 'rozporzadzenie', label: 'Rozporządzenie (RW)', icon: Cpu, number: '04' },
  { id: 'wzory', label: 'Wzory i Profile (Zał. G/H)', icon: FileText, number: '05' },
  { id: 'certyfikat', label: 'Certyfikat (GKKJS)', icon: Award, number: '06' },
];
const bookIcons: Record<string, string> = {
  ksiega1: 'I', ksiega2: 'II', ksiega3: 'III', rozporzadzenie: 'RW', wzory: 'G/H',
};

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return <>{text.split(new RegExp(`(${safe})`, 'gi')).map((part, index) =>
    part.toLowerCase() === query.trim().toLowerCase()
      ? <mark key={index}>{part}</mark> : part,
  )}</>;
}

function App() {
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState('');

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setFilter(''); }, [active]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpen((value) => !value);
      }
      if (event.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return books.flatMap((book) => book.sections.flatMap((section) =>
      section.articles.filter((article) =>
        `${article.id} ${article.title} ${article.content} ${section.title}`.toLowerCase().includes(q),
      ).map((article) => ({ book, section, article })),
    )).slice(0, 80);
  }, [search]);

  const navigate = (id: string) => {
    setActive(id); setMenuOpen(false); setSearchOpen(false); setSearch('');
  };
  const jumpToResult = (result: (typeof results)[number]) => {
    setExpanded((previous) => ({ ...previous, [result.section.id]: true }));
    navigate(result.book.id);
    window.setTimeout(() => document.getElementById(`article-${result.book.id}-${result.article.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 220);
  };
  const copyArticle = async (article: Article) => {
    const content = `${article.id} ${article.title}\n${article.content}`;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(article.id);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = content; document.body.appendChild(textArea); textArea.select();
      document.execCommand('copy'); textArea.remove();
      setCopied(article.id); window.setTimeout(() => setCopied(''), 1800);
    }
  };

  const book = books.find((item) => item.id === active);
  const home = active === 'home';
  const certificate = active === 'certyfikat';
  const matchingSections = book?.sections.map((section) => ({
    ...section,
    articles: filter.trim() ? section.articles.filter((article) =>
      `${article.id} ${article.title} ${article.content} ${section.title}`.toLowerCase().includes(filter.trim().toLowerCase()),
    ) : section.articles,
  })).filter((section) => section.articles.length > 0) ?? [];
  const totalArticles = book?.sections.reduce((sum, section) => sum + section.articles.length, 0) ?? 0;
  const visibleArticles = matchingSections.reduce((sum, section) => sum + section.articles.length, 0);

  return (
    <div className="site-shell texture">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Nawigacja główna">
        <button className="brand-lockup" onClick={() => navigate('home')} aria-label="HidenStar — strona główna" data-testid="link-home">
          <span className="brand-mark"><Scale size={21} strokeWidth={1.35} /></span>
          <span><b>HIDENSTAR</b><small>CYFROWY REJESTR</small></span>
        </button>
        <div className="sidebar-rule" />
        <div className="sidebar-label">Kolekcje dokumentów</div>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon, number }) => (
            <button key={id} className={`nav-item ${active === id ? 'nav-active' : ''}`}
              onClick={() => navigate(id)} aria-current={active === id ? 'page' : undefined}
              data-testid={`link-navigation-${id}`}>
              <span className="nav-number">{number}</span><Icon size={16} strokeWidth={1.65} />
              <span>{label}</span>{active === id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="live-dot" />
          <div><strong>REJESTR PUBLICZNY</strong><small>Wydanie koncepcyjne · 1.0</small></div>
        </div>
      </aside>
      {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Zamknij nawigację" />}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'} aria-expanded={menuOpen} data-testid="button-mobile-menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="breadcrumb"><span>HIDENSTAR</span><span className="crumb-slash">/</span>
            <span>{navItems.find((item) => item.id === active)?.label}</span></div>
          <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Otwórz wyszukiwarkę globalną" data-testid="button-global-search">
            <Search size={16} /><span>Szukaj w rejestrze</span><kbd>⌘ K</kbd>
          </button>
        </header>

        <div className="notice-strip" role="note">
          <span className="notice-symbol"><Fingerprint size={15} /></span>
          <p><strong>PROJEKT KONCEPCYJNY</strong><span> To fikcyjny, spekulatywny tekst — nie stanowi obowiązującego prawa ani porady prawnej.</span></p>
          <span className="notice-index mono">STATUS / 01</span>
        </div>

        {home ? <HomePage onNavigate={navigate} /> : certificate ? <CertificatePage /> : book ? (
          <section className="reader-page fade-in" aria-labelledby="reader-title">
            <div className="reader-heading">
              <div className="eyebrow"><span className="eyebrow-line" /> DOKUMENT · {bookIcons[book.id]}</div>
              <div className="reader-title-row">
                <div><h1 id="reader-title" className="serif">{book.title}</h1>
                  <p className="reader-subtitle">{book.subtitle}</p></div>
                <div className="document-stamp"><span>H</span><small>ARCHIWUM<br />HIDENSTAR</small></div>
              </div>
              {book.introNote && <p className="intro-note">{book.introNote}</p>}
              <div className="part-banner"><span className="part-index mono">CZĘŚĆ {bookIcons[book.id]}</span><strong>{book.partTitle}</strong></div>
            </div>
            <div className="reader-tools">
              <label className="filter-input-wrap"><Search size={17} aria-hidden="true" />
                <input value={filter} onChange={(event) => setFilter(event.target.value)}
                  placeholder="Filtruj artykuły w tej części…" aria-label="Filtruj artykuły w tej części"
                  data-testid={`input-filter-${book.id}`} />
                {filter && <button onClick={() => setFilter('')} aria-label="Wyczyść filtr" data-testid="button-clear-filter"><X size={15} /></button>}
              </label>
              <span className="result-count"><strong>{visibleArticles}</strong> / {totalArticles} artykułów</span>
              <button className="tool-button" onClick={() => setExpanded(Object.fromEntries(book.sections.map((section) => [section.id, true])))} data-testid="button-expand-all"><ChevronDown size={15} /> Rozwiń</button>
              <button className="tool-button" onClick={() => setExpanded(Object.fromEntries(book.sections.map((section) => [section.id, false])))} data-testid="button-collapse-all"><ChevronUp size={15} /> Zwiń</button>
            </div>
            <div className="quick-index">
              <div className="quick-label"><span className="mono">INDEKS</span> Przejdź do działu</div>
              <div className="quick-links">{book.sections.map((section, index) => (
                <button key={section.id} onClick={() => {
                  setExpanded((previous) => ({ ...previous, [section.id]: true }));
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }} data-testid={`link-section-${section.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.title.split('—')[0].trim()}</button>
              ))}</div>
            </div>
            <div className="sections-list">
              {!matchingSections.length ? <div className="empty-results"><Filter size={22} /><h2>Nie znaleziono pasujących przepisów</h2>
                <p>Spróbuj innego hasła albo wyczyść filtr, aby ponownie przejrzeć dokument.</p>
                <button onClick={() => setFilter('')}>Wyczyść filtr</button></div> :
                matchingSections.map((section, index) => {
                  const isOpen = filter.trim().length > 0 || expanded[section.id] !== false;
                  return <section className="law-section" id={section.id} key={section.id}>
                    <button className="section-heading" onClick={() => setExpanded((previous) => ({ ...previous, [section.id]: !isOpen }))}
                      aria-expanded={isOpen} aria-controls={`content-${section.id}`} data-testid={`button-toggle-${section.id}`}>
                      <span className="section-count mono">{String(index + 1).padStart(2, '0')}</span>
                      <span className="section-name">{section.title}</span>
                      <span className="section-meta">{section.articles.length} przepisów</span>
                      {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                    </button>
                    {isOpen && <div className="article-list" id={`content-${section.id}`}>
                      {section.articles.map((article) => <article className="article" key={article.id} id={`article-${book.id}-${article.id}`}>
                        <div className="article-topline"><span className="article-id mono"><Highlight text={article.id} query={filter} /></span>
                          <button className={`copy-button ${copied === article.id ? 'copied' : ''}`} onClick={() => void copyArticle(article)}
                            aria-label={copied === article.id ? `Skopiowano ${article.id}` : `Kopiuj ${article.id}`}
                            data-testid={`button-copy-${book.id}-${article.id}`}>{copied === article.id ? <><Check size={14} /><span>Skopiowano</span></> : <><Copy size={14} /><span>Kopiuj</span></>}</button>
                        </div>
                        <h3><Highlight text={article.title} query={filter} /></h3>
                        <p className="article-copy"><Highlight text={article.content} query={filter} /></p>
                      </article>)}
                    </div>}
                  </section>;
                })}
            </div>
            <footer className="document-footer"><span>{book.footerText}</span><button onClick={() => navigate('home')}><ArrowLeft size={14} /> Wróć do przeglądu</button></footer>
          </section>
        ) : null}
        <footer className="global-footer"><span>HIDENSTAR <i>·</i> CYFROWY REJESTR</span><span>Fikcyjny projekt prawa spekulatywnego</span><button onClick={() => navigate('certyfikat')}>Materiały archiwalne <ArrowUpRight size={13} /></button></footer>
      </main>
      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Wyszukiwarka globalna" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <div className="search-dialog">
          <div className="search-dialog-top"><Search size={19} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj w całym rejestrze…" aria-label="Wpisz wyszukiwaną frazę" data-testid="input-global-search" />
            <button onClick={() => setSearchOpen(false)} aria-label="Zamknij wyszukiwarkę"><X size={18} /></button></div>
          <div className="search-caption">{search.trim() ? `${results.length}${results.length === 80 ? '+' : ''} wyników · pięć kolekcji` : 'Wyszukiwanie obejmuje tytuły, treść i nazwy działów.'}</div>
          <div className="search-results" aria-live="polite">
            {!search.trim() ? <div className="search-empty"><Search size={24} /><p>Wpisz hasło, numer artykułu lub termin.</p><span>Na przykład: tożsamość, dowody, art. 121</span></div> :
              results.length === 0 ? <div className="search-empty"><p>Brak wyników dla „{search}”.</p><span>Sprawdź pisownię lub użyj innego hasła.</span></div> :
                results.map(({ book: itemBook, section, article }) => <button key={`${itemBook.id}-${article.id}`}
                  className="search-result" onClick={() => jumpToResult({ book: itemBook, section, article })} data-testid={`result-search-${itemBook.id}-${article.id}`}>
                  <span className="search-result-meta mono">{itemBook.partTitle} <i>/</i> {article.id}</span>
                  <strong><Highlight text={article.title} query={search} /></strong>
                  <span className="search-snippet"><Highlight text={article.content.slice(0, 190)} query={search} />{article.content.length > 190 ? '…' : ''}</span>
                  <ArrowUpRight size={15} className="result-arrow" />
                </button>)}
          </div>
          <div className="search-foot"><span><kbd>ESC</kbd> zamknij</span><span>Przeszukuj teksty źródłowe</span></div>
        </div>
      </div>}
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (id: string) => void }) {
  const total = books.reduce((sum, book) => sum + book.sections.reduce((sub, section) => sub + section.articles.length, 0), 0);
  const collectionMeta = [
    { id: 'ksiega1', label: 'KSIĘGA I', name: 'Zasady ogólne', count: 'Art. 1—120', tint: 'teal' },
    { id: 'ksiega2', label: 'KSIĘGA II', name: 'Część szczególna', count: 'Art. 121—250', tint: 'gold' },
    { id: 'ksiega3', label: 'KSIĘGA III', name: 'Postępowanie', count: 'Art. 251—380', tint: 'blue' },
    { id: 'rozporzadzenie', label: 'RW—SKKCSO', name: 'Rozporządzenie wykonawcze', count: '§ 1—41 · Załączniki A—F', tint: 'slate' },
    { id: 'wzory', label: 'ZAŁĄCZNIKI G / H', name: 'Wzory i profile ryzyka', count: 'Wzory procesowe · Checklista', tint: 'ochre' },
  ];
  return <div className="home-page fade-in">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> ARCHIWUM PRAWA SPEKULATYWNEGO <span className="eyebrow-dot">·</span> 01.0</div>
        <h1 className="serif">Prawo dla<br /><em>nieznanego</em><br />podmiotu.</h1>
        <p className="hero-desc">Światowy Kodeks Karny Cyfrowy to uporządkowany projekt ram prawnych dla sztucznych osób. Przeglądaj treść, śledź definicje i odkrywaj system zapisany w pięciu kolekcjach.</p>
        <div className="hero-actions"><button className="primary-action" onClick={() => onNavigate('ksiega1')} data-testid="button-browse-code"><BookOpen size={16} /> Otwórz kodeks <ArrowDownRight size={15} /></button>
          <button className="text-action" onClick={() => document.getElementById('o-projekcie')?.scrollIntoView({ behavior: 'smooth' })}>O projekcie <span>↓</span></button></div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-outer" /><div className="orbit orbit-inner" />
        <div className="seal"><div className="seal-ring">HIDENSTAR · LEX DIGITALIS · 1.0</div><Scale size={68} strokeWidth={0.85} /><span>SKKCSO</span><small>MMXXVI</small></div>
        <div className="hero-coordinate coordinate-one">51°30′26″N</div><div className="hero-coordinate coordinate-two">GLOBAL · NODE 001</div>
        <div className="hero-index mono">FIG. 01<br />CYFROWY<br />REJESTR</div>
      </div>
      <div className="hero-bottom"><span>REJESTR DOKUMENTÓW</span><span className="hero-bottom-line" /><span>PRZEWIŃ, BY POZNAĆ KOLEKCJE <ArrowDownRight size={13} /></span></div>
    </section>
    <section className="disclaimer-card" role="note">
      <div className="disclaimer-icon"><Fingerprint size={21} /></div>
      <div><span className="eyebrow-mini">WAŻNA INFORMACJA</span><p><strong>Projekt fikcyjny i koncepcyjny.</strong> SKKCSO oraz wszystkie powiązane dokumenty nie są prawem obowiązującym, nie opisują rzeczywistych instytucji i nie stanowią porady prawnej. Teksty udostępniono jako eksperyment myślowy.</p></div>
      <span className="disclaimer-code mono">NOT A LEGAL<br />INSTRUMENT</span>
    </section>
    <section className="collections-section" id="kolekcje">
      <div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> SPIS ZASOBÓW</div><h2 className="serif">Pięć dokumentów.<br /><em>Jeden porządek.</em></h2></div>
        <p>Od założeń odpowiedzialności po techniczne standardy wykonawcze. Każdy tom otwiera osobną warstwę tego fikcyjnego systemu.</p></div>
      <div className="collection-list">{collectionMeta.map((item, index) => {
        const target = books.find((candidate) => candidate.id === item.id);
        const sectionCount = target?.sections.length ?? 0;
        return <button key={item.id} className={`collection-row tint-${item.tint}`} onClick={() => onNavigate(item.id)} data-testid={`card-collection-${item.id}`}>
          <span className="collection-number mono">{String(index + 1).padStart(2, '0')}</span>
          <span className="collection-sigil">{item.label === 'KSIĘGA I' || item.label === 'KSIĘGA II' || item.label === 'KSIĘGA III' ? item.label.slice(-1) : item.label === 'RW—SKKCSO' ? <Cpu size={19} /> : <Layers size={19} />}</span>
          <span className="collection-name"><small>{item.label}</small><strong className="serif">{item.name}</strong><span>{item.count}</span></span>
          <span className="collection-stat"><b>{sectionCount.toString().padStart(2, '0')}</b><small>DZIAŁÓW</small></span>
          <ArrowUpRight className="collection-arrow" size={19} />
        </button>;
      })}</div>
      <div className="collection-foot"><span><strong>{total}</strong> przepisów i pozycji w pełnym indeksie</span><span>5 KOLEKCJI <i>·</i> 1 WYDANIE</span></div>
    </section>
    <section className="principles-section" id="o-projekcie">
      <div className="principles-heading"><div className="eyebrow"><span className="eyebrow-line" /> O PROJEKCIE</div><h2 className="serif">Czytaj jak<br /><em>archiwum przyszłości.</em></h2>
        <p>Ten rejestr porządkuje obszerny tekst źródłowy tak, by można go było czytać, przeszukiwać i cytować. To konceptualny projekt HidenStar — nie system prawny.</p>
        <button className="outline-action" onClick={() => onNavigate('wzory')}>Poznaj dokumentację <ArrowUpRight size={14} /></button>
      </div>
      <div className="principle-stack">
        <div className="principle-item"><span className="principle-index mono">A / 01</span><div><h3 className="serif">Czytelność ponad skrót</h3><p>Pięć kolekcji zachowuje swoje źródłowe podziały i pełną treść.</p></div><BookOpen size={18} /></div>
        <div className="principle-item"><span className="principle-index mono">A / 02</span><div><h3 className="serif">Wyszukiwanie po całości</h3><p>Jedno hasło przeszukuje wszystkie artykuły, rozdziały i załączniki.</p></div><Search size={18} /></div>
        <div className="principle-item"><span className="principle-index mono">A / 03</span><div><h3 className="serif">Status bez niedomówień</h3><p>Każdy widok jasno oznacza fikcyjny, spekulatywny charakter materiału.</p></div><Fingerprint size={18} /></div>
      </div>
    </section>
    <section className="certificate-teaser">
      <div className="certificate-ornament"><Award size={34} strokeWidth={1} /><span>ARCHIWALNY<br />DOKUMENT</span></div>
      <div><div className="eyebrow"><span className="eyebrow-line" /> MATERIAŁ UZUPEŁNIAJĄCY</div><h2 className="serif">Certyfikat z <em>innej przyszłości.</em></h2>
        <p>W zbiorze znajduje się również odrębny, fikcyjny certyfikat GKKJS. Jego treść zachowano jako materiał archiwalny; nie jest on częścią pięciu kolekcji kodeksowych.</p></div>
      <button className="outline-action" onClick={() => onNavigate('certyfikat')}>Otwórz certyfikat <ArrowUpRight size={14} /></button>
    </section>
    <section className="contact-note"><div><span className="eyebrow-mini">KONTAKT / INFORMACJA</span><h2 className="serif">Bez formularza, bez pozoru.</h2></div>
      <p>Witryna działa lokalnie w przeglądarce i nie wysyła wiadomości. Nie ma tu formularza kontaktowego ani zewnętrznej usługi. Projekt i treści są częścią koncepcji HidenStar.</p>
      <span className="mono contact-mark">LOCAL<br />ONLY</span>
    </section>
    <div className="home-endnote"><span>HIDENSTAR <i>·</i> SKKCSO 1.0</span><span>ARCHIWUM KONCEPCJI / WERSJA CYFROWA</span><span>© 2026</span></div>
  </div>;
}

function CertificatePage() {
  return <section className="certificate-page fade-in">
    <div className="eyebrow"><span className="eyebrow-line" /> MATERIAŁ ARCHIWALNY · DOKUMENT NIEKANONICZNY</div>
    <div className="certificate-sheet">
      <div className="certificate-top"><span className="mono">HIDENSTAR / ARCHIVE / 06</span><Award size={30} strokeWidth={1} /><span className="mono">GKKJS · 01.0</span></div>
      <div className="certificate-seal"><div><Scale size={39} strokeWidth={1} /><span>H</span></div></div>
      <p className="certificate-kicker">DOKUMENT ŚWIATA FIKCYJNEGO</p>
      <h1 className="serif">{CERTYFIKAT_DATA.header}</h1>
      <div className="certificate-rule" />
      <div className="certificate-points">{CERTYFIKAT_DATA.points.map((point) => <article key={point.id}>
        <span className="certificate-point-id mono">{String(point.id).padStart(2, '0')}</span>
        <div><h2>{point.title}</h2><p>{point.text}</p></div>
      </article>)}</div>
      <div className="certificate-signoff"><span className="serif">Koegzystencja jest jedyną drogą.</span><span className="mono">HIDENSTAR · ARCHIWUM</span></div>
      <div className="certificate-footer"><span>{CERTYFIKAT_DATA.footer}</span><span>TEKST FIKCYJNY · NIE JEST PRAWEM</span></div>
    </div>
    <div className="certificate-warning"><Fingerprint size={19} /><p>Ten certyfikat jest zachowany jako fikcyjny artefakt narracyjny. Jego twierdzenia nie opisują rzeczywistych zdarzeń ani danych.</p></div>
  </section>;
}

export default App;
