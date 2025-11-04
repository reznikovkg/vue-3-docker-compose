export const DictophoneModule = {
  namespaced: true,
  state: {
    isRecording: false,
    recordings: [],
    currentAudioUrl: null,
    error: null,
    mediaRecorder: null,
    audioChunks: [],
    hasUnsavedRecording: false
  },
  getters: {
    getIsRecording: (state) => state.isRecording,
    getRecordings: (state) => state.recordings,
    getCurrentAudioUrl: (state) => state.currentAudioUrl,
    getRecordingsCount: (state) => state.recordings.length,
    getHasRecordings: (state) => state.recordings.length > 0,
  },
  mutations: {
    SET_RECORDING(state, isRecording) {
      state.isRecording = isRecording
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_MEDIA_RECORDER(state, mediaRecorder) {
      state.mediaRecorder = mediaRecorder
    },
    SET_AUDIO_CHUNKS(state, audioChunks) {
      state.audioChunks = audioChunks
    },
    ADD_AUDIO_CHUNK(state, chunk) {
      state.audioChunks.push(chunk)
    },
    ADD_RECORDING(state, recording) {
      state.recordings.unshift(recording)
    },
    SET_CURRENT_AUDIO_URL(state, url) {
      state.currentAudioUrl = url
    },
    SET_HAS_UNSAVED_RECORDING(state, hasUnsaved) {
      state.hasUnsavedRecording = hasUnsaved
    },
    DELETE_RECORDING(state, id) {
      const index = state.recordings.findIndex(rec => rec.id === id)
      if (index !== -1) {
        URL.revokeObjectURL(state.recordings[index].url)
        state.recordings.splice(index, 1)
      }
    },
    CLEAR_ALL_RECORDINGS(state) {
      state.recordings.forEach(recording => {
        URL.revokeObjectURL(recording.url)
      })
      state.recordings = []
      state.currentAudioUrl = null
    },
    CLEAR_UNSAVED_RECORDING(state) {
      if (state.currentAudioUrl) {
        URL.revokeObjectURL(state.currentAudioUrl)
        state.currentAudioUrl = null
      }
      state.audioChunks = []
      state.hasUnsavedRecording = false
    }
  },
  actions: {
    startRecording({ commit, state }) {
      return new Promise((resolve) => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Audio recording is not supported in this browser')
          }

          navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          }).then((stream) => {
            const mediaRecorder = new MediaRecorder(stream)
            commit('SET_AUDIO_CHUNKS', [])
            commit('SET_ERROR', null)
            commit('SET_HAS_UNSAVED_RECORDING', false)

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                commit('ADD_AUDIO_CHUNK', event.data)
              }
            }

            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' })
              const audioUrl = URL.createObjectURL(audioBlob)

              commit('SET_CURRENT_AUDIO_URL', audioUrl)
              commit('SET_HAS_UNSAVED_RECORDING', true)

              stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.onerror = (event) => {
              console.error('MediaRecorder error:', event)
              commit('SET_ERROR', 'Recording error occurred')
              commit('SET_RECORDING', false)
            }

            mediaRecorder.start(1000)
            commit('SET_MEDIA_RECORDER', mediaRecorder)
            commit('SET_RECORDING', true)
            resolve(true)

          }).catch((err) => {
            console.error('Error starting recording:', err)
            commit('SET_ERROR', `Failed to access microphone: ${err.message}`)
            resolve(false)
          })

        } catch (err) {
          console.error('Error starting recording:', err)
          commit('SET_ERROR', `Failed to access microphone: ${err.message}`)
          resolve(false)
        }
      })
    },

    stopRecording({ commit, state }) {
      if (state.mediaRecorder && state.isRecording) {
        state.mediaRecorder.stop()
        commit('SET_RECORDING', false)
      }
    },

    saveRecording({ commit, state }, name = null) {
      if (state.currentAudioUrl && state.hasUnsavedRecording) {
        const recordingName = name || `Recording_${state.recordings.length + 1}`

        const newRecording = {
          id: Date.now().toString(),
          url: state.currentAudioUrl,
          duration: Math.round(state.audioChunks.length * 0.1),
          date: new Date().toLocaleString('ru-RU'),
          name: recordingName
        }

        commit('ADD_RECORDING', newRecording)
        commit('SET_HAS_UNSAVED_RECORDING', false)
        commit('SET_AUDIO_CHUNKS', [])

        return newRecording.id
      }
      return null
    },

    discardRecording({ commit }) {
      commit('CLEAR_UNSAVED_RECORDING')
    },

    deleteRecording({ commit }, id) {
      commit('DELETE_RECORDING', id)
    },

    clearAllRecordings({ commit }) {
      if (confirm('Are you sure you want to delete all recordings?')) {
        commit('CLEAR_ALL_RECORDINGS')
      }
    }
  }
}