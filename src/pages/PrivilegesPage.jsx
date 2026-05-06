import { useState } from "react";
import { Star, X } from "lucide-react";

export function PrivilegesPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const privileges = [
    { title: "Senior UZ", image: "/senior-privilegiya-uz.png" },
    { title: "Senior RU", image: "/senior-привилегия-ru.png" },
    { title: "Junior UZ", image: "/junior-privilegiya-uz.png" },
    { title: "Junior RU", image: "/junior-привилегия-ru.png" }
  ];

  return (
    <div className="privileges-layout page-stack">
      <div className="current-lesson">
        <div className="current-lesson-icon">
          <Star size={32} />
        </div>
        <div>
          <span className="eyebrow">Imtiyozlar</span>
          <h3>O'quvchilar uchun privelegiyalar</h3>
          <p>Rasmni kattalashtirish uchun ustiga bosing.</p>
        </div>
      </div>

      <div className="privileges-grid">
        {privileges.map((item, index) => (
          <article
            key={index}
            className="privilege-card panel"
            onClick={() => setSelectedImage(item)}
            style={{ cursor: "zoom-in" }}
          >
            <div className="panel-header">
              <div className="panel-title">
                <span>{index + 1}</span>
                <h3>{item.title}</h3>
              </div>
            </div>
            <div className="privilege-image-container">
              <img src={item.image} alt={item.title} loading="lazy" />
            </div>
          </article>
        ))}
      </div>

      {selectedImage && (
        <div className="image-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content">
            <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
              <X size={32} />
            </button>
            <img src={selectedImage.image} alt={selectedImage.title} />
            <div className="image-modal-caption">
              <h3>{selectedImage.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
