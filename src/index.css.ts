import { Styles } from '@ijstech/components';
import Assets from './assets';
const Theme = Styles.Theme.ThemeVars;

const colorVar = {
  primaryButton: 'transparent linear-gradient(90deg, #AC1D78 0%, #E04862 100%) 0% 0% no-repeat padding-box',
  primaryGradient: 'linear-gradient(255deg,#f15e61,#b52082)',
  darkBg: '#181E3E 0% 0% no-repeat padding-box',
  primaryDisabled: 'transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box !important'
}

export const buybackDappContainer = Styles.style({
  $nest: {
    'dapp-container-body': {
      $nest: {
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px'
        },
        '&::-webkit-scrollbar-track': {
          borderRadius: '10px',
          border: '1px solid transparent',
          background: `${Theme.divider} !important`
        },
        '&::-webkit-scrollbar-thumb': {
          background: `${Theme.colors.primary.main} !important`,
          borderRadius: '10px',
          outline: '1px solid transparent'
        }
      }
    }
  }
})

export const buybackComponent = Styles.style({
  $nest: {
    'span': {
      letterSpacing: '0.15px',
    },
    '.i-loading-overlay': {
      background: Theme.background.main,
    },
    '.btn-os': {
      background: colorVar.primaryButton,
      height: 'auto !important',
      color: '#fff',
      // color: Theme.colors.primary.contrastText,
      transition: 'background .3s ease',
      fontSize: '1rem',
      fontWeight: 'bold',
      $nest: {
        'i-icon.loading-icon': {
          marginInline: '0.25rem',
          width: '16px !important',
          height: '16px !important',
        },
        'svg': {
          // fill: `${Theme.colors.primary.contrastText} !important`
          fill: `#fff !important`
        }
      },
    },
    '.btn-os:not(.disabled):not(.is-spinning):hover, .btn-os:not(.disabled):not(.is-spinning):focus': {
      background: colorVar.primaryGradient,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      opacity: .9
    },
    '.btn-os:not(.disabled):not(.is-spinning):focus': {
      boxShadow: '0 0 0 0.2rem rgb(0 123 255 / 25%)'
    },
    '.btn-os.disabled, .btn-os.is-spinning': {
      background: colorVar.primaryDisabled,
      opacity: 1
    },
    '.hidden': {
      display: 'none !important'
    },
    '.buyback-layout': {
      width: '100%',
      minHeight: 340,
      marginInline: 'auto',
      overflow: 'hidden',
    },
    'i-link': {
      display: 'flex',
      $nest: {
        '&:hover *': {
          color: '#fff',
          opacity: 0.9,
        },
      },
    },
    '.cursor-default': {
      cursor: 'default',
    },
    '.custom-timer': {
      display: 'flex',
      $nest: {
        '.timer-value': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
          paddingInline: 4,
          minWidth: 20,
          height: 20,
          fontSize: 14
        },
        '.timer-unit': {
          display: 'flex',
          alignItems: 'center',
        },
      },
    },
    '.input-amount > input': {
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: '1rem',
      color: Theme.input.fontColor
    },
    '.highlight-box': {
      borderColor: '#E53780 !important'
    },
    'i-modal .modal': {
      background: Theme.background.modal,
    },
    '#loadingElm.i-loading--active': {
      marginTop: '2rem',
      position: 'initial',
      $nest: {
        '#emptyStack': {
          display: 'none !important',
        },
        '#gridDApp': {
          display: 'none !important',
        },
        '.i-loading-spinner': {
          marginTop: '2rem',
        },
      },
    }
  }
})
