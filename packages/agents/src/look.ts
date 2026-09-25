/**
 * Apariencia de los agentes (docs/ALTEC-VO.md §6.1, campo `look`).
 *
 * Son colores FIGURATIVOS: ropa, cabello y piel de personas, no piezas de
 * interfaz. Vienen del prototipo (docs/referencias/oficina-3d.html) y se
 * conservan tal cual.
 *
 * La identidad de ALTEC manda en el dashboard, no dentro de la escena. Quien
 * quiera vestir al equipo de otra forma sobreescribe estos valores; el tema de
 * la escena (packages/office3d/src/themes) hace lo propio con la oficina.
 */
export type Look = {
  /** Color de la ropa. */
  readonly wear: string;
  /** Corbata, mascada o detalle de contraste. */
  readonly accent?: string;
  readonly hair: string;
  readonly skin: string;
  readonly longHair?: boolean;
};
