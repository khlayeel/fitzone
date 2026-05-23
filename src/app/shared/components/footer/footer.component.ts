import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <footer class="footer no-print">
      <div class="page-shell footer-inner">
        <div>
          <h3>FitZone</h3>
          <p class="muted">Salle de sport premium, coaching local et expérience cohérente sur tout le site.</p>
        </div>
        <div class="footer-links">
          <a mat-button href="tel:+21670000000">+216 70 000 000</a>
          <a mat-button href="mailto:contact@fitzone.tn">contact@fitzone.tn</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--fz-border);
      background: linear-gradient(180deg, rgba(9, 10, 13, 0.8), rgba(6, 7, 10, 0.96));
      margin-top: 48px;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 24px 0 36px;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    @media (max-width: 900px) {
      .footer-inner {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class FooterComponent {}
