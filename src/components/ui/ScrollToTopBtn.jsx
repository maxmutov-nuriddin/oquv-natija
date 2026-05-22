import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const MODAL_SELECTOR = ".modal-backdrop, .anl-overlay, .qg-overlay, .image-modal-backdrop, .sidebar-overlay";

export function ScrollToTopBtn() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }

    function checkModal() {
      setModalOpen(!!document.querySelector(MODAL_SELECTOR));
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: false });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible || modalOpen) return null;

  return (
    <button className="scroll-to-top-btn" onClick={scrollToTop} aria-label="Tepaga qaytish">
      <ArrowUp size={20} />
    </button>
  );
}
