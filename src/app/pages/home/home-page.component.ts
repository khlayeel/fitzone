import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatChipsModule],
  template: `
    <section class="page-section">
      <div class="page-shell grid hero-grid">
        <div class="hero-panel hero-copy">
          <mat-chip-set class="chip-row">
            <mat-chip> Gym Premium</mat-chip>
            <mat-chip> Coaching Local</mat-chip>
            <mat-chip>✓ 100% Offline</mat-chip>
          </mat-chip-set>
          <h1>Entraîne-toi comme un pro, avec la technologie FitZone.</h1>
          <p>
            FitZone assemble entraînement, réservation et suivi avec une interface premium, 
            cohérente et intuitive. De la sélection à la confirmation, tout est fluide.
          </p>
          <div class="hero-actions">
            <a mat-raised-button color="primary" routerLink="/register" class="cta-btn">S'inscrire maintenant</a>
            <a mat-stroked-button routerLink="/pricing" class="secondary-btn">Voir les tarifs</a>
          </div>
          <div class="hero-stats">
            <div class="inline-stat">
              <strong>8+</strong>
              <span>Cours hebdo</span>
            </div>
            <div class="inline-stat">
              <strong>6</strong>
              <span>Coachs experts</span>
            </div>
            <div class="inline-stat">
              <strong>3</strong>
              <span>Plans flexibles</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <img src="assets/images/cours-collectif-cardio.png" alt="Cours collectif" class="hero-image" />
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="page-shell">
        <h2 class="section-title"> Services Premium</h2>
        <p class="section-subtitle">Trois univers d'entraînement pensés pour ta progression.</p>
        <div class="grid grid-3">
          <mat-card class="service-card feature-card">
            <img class="service-icon" src="assets/images/r.jpeg" alt="Musculation" />
            <mat-card-header><mat-card-title>Musculation</mat-card-title></mat-card-header>
            <mat-card-content><p>Machines haut de gamme, charges libres et coaching technique expert.</p></mat-card-content>
          </mat-card>
          <mat-card class="service-card feature-card">
            <img class="service-icon" src="assets/images/cours-collectif-cardio.png" alt="Cardio & Fitness" />
            <mat-card-header><mat-card-title>Cardio & Fitness</mat-card-title></mat-card-header>
            <mat-card-content><p>Tapis, rameurs, vélos et programmes d'endurance ciblés et efficaces.</p></mat-card-content>
          </mat-card>
          <mat-card class="service-card feature-card">
            <img class="service-icon" src="assets/images/istockphoto.jpg" alt="Cours collectifs" />
            <mat-card-header><mat-card-title>Cours Collectifs</mat-card-title></mat-card-header>
            <mat-card-content><p>HIIT, yoga, boxe, pilates avec instructeurs motivants en groupe.</p></mat-card-content>
          </mat-card>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="page-shell">
        <h2 class="section-title">⭐ Témoignages Membres</h2>
        <p class="section-subtitle">Des vrais utilisateurs, des résultats concrets.</p>
        <div class="grid grid-3">
          <mat-card class="testimonial-card">
            <div class="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <mat-card-content>
              <p class="testimonial-text">"Le combo plan Premium + HIIT m'a remis dans une routine sérieuse. L'interface est fluide."</p>
              <strong class="testimonial-author">Nour, 29 ans</strong>
              <span class="testimonial-tag">Premium Membre</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="testimonial-card">
            <div class="testimonial-rating">⭐⭐⭐⭐</div>
            <mat-card-content>
              <p class="testimonial-text">"Interface claire, inscription rapide, et le coaching est très professionnel et concret."</p>
              <strong class="testimonial-author">Hamza, 34 ans</strong>
              <span class="testimonial-tag">VIP Membre</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="testimonial-card">
            <div class="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <mat-card-content>
              <p class="testimonial-text">"une experience genial,tres organise"</p>
              <strong class="testimonial-author">Ons, 26 ans</strong>
              <span class="testimonial-tag">Basic Membre</span>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-grid {
      grid-template-columns: 1.2fr 0.8fr;
      gap: 32px;
      align-items: center;
    }

    .hero-copy {
      padding: 40px;
    }

    .hero-copy h1 {
      font-size: clamp(2.8rem, 6vw, 4.5rem);
      line-height: 1.1;
      margin: 24px 0 20px;
    }

    .hero-copy p {
      font-size: 1.1rem;
      color: var(--fz-muted);
      max-width: 55ch;
      margin-bottom: 28px;
      line-height: 1.8;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .cta-btn {
      box-shadow: 0 8px 24px rgba(255, 61, 84, 0.35);
      font-size: 1rem;
      padding: 12px 32px;
    }

    .secondary-btn {
      border-width: 2px;
      font-weight: 700;
      padding: 11px 31px;
    }

    .hero-stats {
      display: flex;
      gap: 32px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--fz-border);
    }

    .inline-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .inline-stat strong {
      font-size: 1.8rem;
      color: var(--fz-primary);
    }

    .inline-stat span {
      font-size: 0.85rem;
      color: var(--fz-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .hero-visual {
      position: relative;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(255, 61, 84, 0.08) 0%, rgba(0, 212, 255, 0.05) 100%);
      border: 1px solid var(--fz-border);
      border-radius: 20px;
      padding: 40px;
      overflow: hidden;
    }

    .hero-visual::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(255, 61, 84, 0.1), transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(0, 212, 255, 0.1), transparent 50%);
      pointer-events: none;
    }

    .hero-image {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 480px;
      height: auto;
      filter: drop-shadow(0 12px 32px rgba(255, 61, 84, 0.22));
      transform: translateY(-6px);
    }

    .service-card {
      text-align: center;
      transition: all 0.3s ease;
    }

    .service-card:hover {
      transform: translateY(-8px);
      border-color: rgba(255, 61, 84, 0.4);
      box-shadow: 0 16px 48px rgba(255, 61, 84, 0.15);
    }

    .service-icon {
      width: 120px;
      height: 120px;
      object-fit: cover;
      margin: 20px auto 16px;
      border-radius: 12px;
      display: block;
      box-shadow: 0 8px 20px rgba(255, 61, 84, 0.2);
    }

    mat-card-title {
      font-size: 1.3rem;
      color: var(--fz-text);
    }

    mat-card-content {
      color: var(--fz-muted);
      font-size: 0.95rem;
      line-height: 1.7;
    }

    .testimonial-card {
      transition: all 0.3s ease;
    }

    .testimonial-card:hover {
      transform: translateY(-6px);
      border-color: rgba(0, 212, 255, 0.3);
    }

    .testimonial-rating {
      font-size: 1.2rem;
      margin-bottom: 12px;
    }

    .testimonial-text {
      font-size: 1rem;
      font-style: italic;
      color: var(--fz-text);
      margin-bottom: 16px;
      line-height: 1.7;
    }

    .testimonial-author {
      display: block;
      color: var(--fz-primary);
      font-weight: 700;
      margin-bottom: 8px;
    }

    .testimonial-tag {
      display: inline-block;
      background: rgba(0, 212, 255, 0.1);
      color: var(--fz-accent);
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    @media (max-width: 900px) {
      .hero-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .hero-visual {
        height: 300px;
      }

      .hero-stats {
        gap: 24px;
      }
    }
  `]
})
export class HomePageComponent {}
