<template>
  <component
    :is="tag"
    class="collapsible-sidebar"
    :class="[
      `collapsible-sidebar--${direction}`,
      {
        'collapsible-sidebar--collapsed': isCollapsed
      }
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
      default: false
    },
    direction: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right', 'top', 'bottom'].includes(value)
    },
    mobileMode: {
      type: String,
      default: 'force-expanded',
      validator: (value) => ['force-expanded', 'collapsible'].includes(value)
    },
    mobileBreakpoint: {
      type: Number,
      default: MOBILE_BREAKPOINT
    },
    peekSize: {
      type: Number,
      default: 48
    },
    toggleSize: {
      type: Number,
      default: 28
    },
    collapsedMinHeight: {
      type: Number,
      default: 0
    },
    collapsedMinWidth: {
      type: Number,
      default: 0
    },
    tag: {
      type: String,
      default: 'aside'
    }
  },
  emits: ['toggle', 'update:collapsed'],
  data() {
    return {
      viewportWidth: 0
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
        '--collapsible-sidebar-collapsed-min-width': `${this.collapsedMinWidth}px`
      }
    }
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
    }
  }
}
</script>

<style scoped lang="scss">
.collapsible-sidebar {
  position: relative;

  &__toggle {
    height: var(--collapsible-sidebar-toggle-size);
    position: absolute;
    top: 10px;
    width: var(--collapsible-sidebar-toggle-size);
    z-index: 1;
  }

  &__content {
    margin-top: calc(var(--collapsible-sidebar-toggle-size) + 8px);
  }

  &--left &__toggle {
    right: 10px;
  }

  &--right &__toggle {
    left: 10px;
  }

  &--collapsed {
    &.collapsible-sidebar--left {
      min-height: var(--collapsible-sidebar-collapsed-min-height);
      transform: translateX(calc(-100% + var(--collapsible-sidebar-peek-size)));
    }

    &.collapsible-sidebar--right {
      min-height: var(--collapsible-sidebar-collapsed-min-height);
      transform: translateX(calc(100% - var(--collapsible-sidebar-peek-size)));
    }
  }
}
</style>
