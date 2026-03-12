<template>
	<div class="craft">
		<div class="craft__grid">
			<div
			class="craft__slot"
			v-for="(slot, index) in craftSlots"
			:key="index"
			@dragover="(e) => e.preventDefault()"
			@drop="(e) => drop(e, index)"
			>
			  <img
				v-if="slot"
				:src="getElementById(slot).picture"
				class="craft__image"
				/>
			</div>
		</div>
		<div class="craft__actions">
			<button class="craft__actions-button" @click="() => craftMix()">Крафт</button>
			<button class="craft__actions-button" @click="() => clearCraft()">Сбросить</button>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'CraftTable',
	computed: {
		...mapGetters(['craftSlots', 'getElementById'])
	},
	methods: {
		...mapActions(['placeInSlot', 'craftMix', 'clearCraft']),

		drop(e, index) {
			const id = Number(e.dataTransfer.getData('elementId'))
			this.placeInSlot({
				slot: index,
				id: id
			})
		}
	}
}
</script>

<style scoped lang="scss">
.craft {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;

	&__grid {
		display: grid;
		grid-template-columns: repeat(3, 80px);
		gap: 8px;
	}

	&__slot {
		width: 80px;
		height: 80px;
		border: 2px dashed #770059;
		background-color: rgba(255, 255, 255, 0.041);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	&__actions {
		display: flex;
		gap: 10px; 
	}
	&__actions-button{
		border-radius: 12px;
		padding: 10px;
		font-size: 16px;
		border: 2px solid rgb(181, 67, 185);
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background-color: #b543b9;
			color: white;
			transform: scale(1.05);
		}
	}
	&__image {
		width: 60px;
		height: 60px;
		object-fit: contain;
	}
}
</style>