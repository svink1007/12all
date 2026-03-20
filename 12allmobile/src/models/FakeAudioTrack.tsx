export class FakeAudioTrack {
  private audioDestination: MediaStreamAudioDestinationNode | null = null;

  getTrack() {
    if (!this.audioDestination) {
      const audioContext = new AudioContext();
      this.audioDestination = audioContext.createMediaStreamDestination();
    }

    return this.audioDestination.stream.getAudioTracks()[0];
  }

  stopTrack() {
    this.audioDestination &&
      this.audioDestination.stream
        .getAudioTracks()
        .forEach((track) => track.stop());
  }
}
