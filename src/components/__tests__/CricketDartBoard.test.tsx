import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import CricketDartBoard from '../molecules/CricketDartBoard';
import { renderWithProviders } from '../../test/utils/renderWithProviders';
import { mockCricketGameState } from '../../test/mocks/gameState';

describe('CricketDartBoard', () => {
  const mockOnScoreClick = vi.fn();
  const mockOnTurnComplete = vi.fn();

  const defaultProps = {
    gameState: mockCricketGameState,
    onScoreClick: mockOnScoreClick,
    currentPlayerId: '1',
    onTurnComplete: mockOnTurnComplete
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    renderWithProviders(<CricketDartBoard {...defaultProps} />);
    
    // Vérifier que les cibles sont affichées avec leurs différentes zones
    expect(screen.getByTestId('target-20-single')).toBeInTheDocument();
    expect(screen.getByTestId('target-20-double')).toBeInTheDocument();
    expect(screen.getByTestId('target-20-triple')).toBeInTheDocument();
    
    // Vérifier que le bouton de validation n'est pas visible initialement
    expect(screen.queryByTestId('validate-score-button')).not.toBeInTheDocument();
  });

  it('should handle dart hits', async () => {
    renderWithProviders(<CricketDartBoard {...defaultProps} />);
    
    // Simuler 3 lancers avec des coordonnées
    const mockEvent = {
      currentTarget: {
        closest: () => ({
          getBoundingClientRect: () => ({
            left: 0,
            top: 0,
            width: 400,
            height: 400
          }),
          viewBox: {
            baseVal: {
              width: 400,
              height: 400
            }
          }
        })
      },
      clientX: 200,
      clientY: 50
    };

    // Simuler 3 lancers sur différentes zones de la cible 20
    fireEvent.click(screen.getByTestId('target-20-single'), mockEvent);
    fireEvent.click(screen.getByTestId('target-20-double'), mockEvent);
    fireEvent.click(screen.getByTestId('target-20-triple'), mockEvent);
    
    // Vérifier que les indicateurs de fléchettes sont mis à jour
    expect(screen.getByTestId('dart-indicator-1')).toHaveClass('bg-[var(--glass-bg)]');
    expect(screen.getByTestId('dart-indicator-2')).toHaveClass('bg-[var(--glass-bg)]');
    expect(screen.getByTestId('dart-indicator-3')).toHaveClass('bg-[var(--glass-bg)]');
    
    // Vérifier que le bouton de validation apparaît
    expect(screen.getByTestId('validate-score-button')).toBeInTheDocument();
  });

  it('should validate scores correctly', async () => {
    renderWithProviders(<CricketDartBoard {...defaultProps} />);
    
    // Simuler 3 lancers avec des coordonnées
    const mockEvent = {
      currentTarget: {
        closest: () => ({
          getBoundingClientRect: () => ({
            left: 0,
            top: 0,
            width: 400,
            height: 400
          }),
          viewBox: {
            baseVal: {
              width: 400,
              height: 400
            }
          }
        })
      },
      clientX: 200,
      clientY: 50
    };

    // Simuler 3 lancers sur différentes zones de la cible 20
    fireEvent.click(screen.getByTestId('target-20-single'), mockEvent);
    fireEvent.click(screen.getByTestId('target-20-double'), mockEvent);
    fireEvent.click(screen.getByTestId('target-20-triple'), mockEvent);
    
    // Cliquer sur le bouton de validation
    const validateButton = screen.getByTestId('validate-score-button');
    fireEvent.click(validateButton);
    
    // Vérifier que onScoreClick a été appelé avec les bons paramètres
    expect(mockOnScoreClick).toHaveBeenCalledWith([
      expect.objectContaining({ target: 20, multiplier: 1 }),
      expect.objectContaining({ target: 20, multiplier: 2 }),
      expect.objectContaining({ target: 20, multiplier: 3 })
    ]);
    
    // Vérifier que onTurnComplete a été appelé
    expect(mockOnTurnComplete).toHaveBeenCalled();
  });

  it('should handle miss clicks', () => {
    renderWithProviders(<CricketDartBoard {...defaultProps} />);
    
    // Simuler un clic sur la zone de Miss
    const missZone = screen.getByTestId('miss-zone');
    if (!missZone) throw new Error('Miss zone not found');
    
    // Simuler 3 lancers avec des coordonnées
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100
        })
      },
      clientX: 50,
      clientY: 50
    };

    // Simuler 3 lancers manqués
    fireEvent.click(missZone, mockEvent);
    fireEvent.click(missZone, mockEvent);
    fireEvent.click(missZone, mockEvent);
    
    // Vérifier que le bouton de validation apparaît
    const validateButton = screen.getByTestId('validate-score-button');
    fireEvent.click(validateButton);
    
    // Vérifier que onScoreClick a été appelé avec un tableau vide (pas de scores valides)
    expect(mockOnScoreClick).toHaveBeenCalledWith([]);
    expect(mockOnTurnComplete).toHaveBeenCalled();
  });
}); 