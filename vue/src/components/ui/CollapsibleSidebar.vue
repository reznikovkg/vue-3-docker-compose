<template>
  <component
    :is="tag"
    class="collapsible-sidebar"
    :class="[
      `collapsible-sidebar--${direction}`,
      {
        'collapsible-sidebar--collapsed': isCollapsed,
      },
    ]"
    :style="rootStyle"
  >
    <button
      v-if="shouldShowToggle"
      class="collapsible-sidebar__toggle"
      type="button"
      @click="() => toggle()"
    >
      <slot name="toggle">{{ toggleLabel }}</slot>
    </button>
    <div v-show="!isCollapsed" class="collapsible-sidebar__content">
      <slot />
    </div>
  </component>
</template>

<script>
const MOBILE_BREAKPOINT = 900

export default {
  name: 'CollapsibleSidebar',
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
    direction: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right', 'top', 'bottom'].includes(value),
    },
    mobileMode: {
      type: String,
      default: 'force-expanded',
      validator: (value) => ['force-expanded', 'collapsible'].includes(value),
    },
    mobileBreakpoint: {
      type: Number,
      default: MOBILE_BREAKPOINT,
    },
    peekSize: {
      type: Number,
      default: 48,
    },
    toggleSize: {
      type: Number,
      default: 28,
    },
    collapsedMinHeight: {
      type: Number,
      default: 0,
    },
    collapsedMinWidth: {
      type: Number,
      default: 0,
    },
    tag: {
      type: String,
      default: 'aside',
    },
  },
  emits: ['toggle', 'update:collapsed'],
  data() {
    return {
      viewportWidth: 0,
    }
  },
  computed: {
    isMobileViewport() {
      return this.viewportWidth < this.mobileBreakpoint
    },
    canCollapse() {
      if (!this.isMobileViewport) {
        return true
      }

      return this.mobileMode === 'collapsible'
    },
    isCollapsed() {
      if (!this.canCollapse) {
        return false
      }

      return this.collapsed
    },
    shouldShowToggle() {
      return this.canCollapse
    },
    toggleLabel() {
      if (this.direction === 'left') {
        return this.isCollapsed ? '>' : '<'
      }

      if (this.direction === 'right') {
        return this.isCollapsed ? '<' : '>'
      }

      if (this.direction === 'top') {
        return this.isCollapsed ? 'v' : '^'
      }

      return this.isCollapsed ? '^' : 'v'
    },
    rootStyle() {
      return {
        '--collapsible-sidebar-peek-size': `${this.peekSize}px`,
        '--collapsible-sidebar-toggle-size': `${this.toggleSize}px`,
        '--collapsible-sidebar-collapsed-min-height': `${this.collapsedMinHeight}px`,
        '--collapsible-sidebar-collapsed-min-width': `${this.collapsedMinWidth}px`,
      }
    },
  },
  mounted() {
    this.syncViewportWidth()
    window.addEventListener('resize', this.onWindowResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize)
  },
  methods: {
    onWindowResize() {
      this.syncViewportWidth()
    },
    syncViewportWidth() {
      this.viewportWidth = window.innerWidth
    },
    toggle() {
      const nextValue = !this.collapsed
      this.$emit('toggle', nextValue)
      this.$emit('update:collapsed', nextValue)
    },
  },
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as mixins;
@use '@/styles/tokens' as tokens;

.collapsible-sidebar {
  position: relative;
  transition: transform 180ms ease;

  &--collapsed {
    &.collapsible-sidebar--left {
      min-height: var(--collapsible-sidebar-collapsed-min-height);
      transform: translateX(calc(-100% + var(--collapsible-sidebar-peek-size)));
    }

    &.collapsible-sidebar--right {
      min-height: var(--collapsible-sidebar-collapsed-min-height);
      transform: translateX(calc(100% - var(--collapsible-sidebar-peek-size)));
    }

    &.collapsible-sidebar--top {
      min-width: var(--collapsible-sidebar-collapsed-min-width);
      transform: translateY(calc(-100% + var(--collapsible-sidebar-peek-size)));
    }

    &.collapsible-sidebar--bottom {
      min-width: var(--collapsible-sidebar-collapsed-min-width);
      transform: translateY(calc(100% - var(--collapsible-sidebar-peek-size)));
    }
  }

  &__toggle {
    align-items: center;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid tokens.$fishing-panel-border;
    border-radius: 8px;
    color: tokens.$fishing-panel-text;
    cursor: pointer;
    display: inline-flex;
    font-size: 14px;
    font-weight: 700;
    height: var(--collapsible-sidebar-toggle-size);
    justify-content: center;
    padding: 0;
    position: absolute;
    width: var(--collapsible-sidebar-toggle-size);
    z-index: 1;
  }

  &--left &__toggle {
    right: 10px;
    top: 10px;
  }

  &--right &__toggle {
    left: 10px;
    top: 10px;
  }

  &--top &__toggle {
    bottom: 10px;
    left: 10px;
  }

  &--bottom &__toggle {
    left: 10px;
    top: 10px;
  }

  &__content {
    display: grid;
    margin-top: calc(var(--collapsible-sidebar-toggle-size) + 8px);
  }

  &__toggle:focus-visible {
    @include mixins.focus-ring(tokens.$button-focus-ring);
  }
}
</style>
