import wave
import struct
import math
import os

def generate_kick(filepath):
    # Audio parameters
    sample_rate = 44100
    duration = 0.3  # seconds
    num_samples = int(sample_rate * duration)
    
    # Kick synthesis parameters
    start_freq = 150.0
    end_freq = 40.0
    decay_constant = 15.0  # Controls pitch drop speed
    volume_decay = 8.0     # Controls volume fade out
    
    # Open WAV file for writing
    with wave.open(filepath, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        phase = 0.0
        for i in range(num_samples):
            t = i / sample_rate
            
            # Pitch envelope: frequency drops over time
            current_freq = end_freq + (start_freq - end_freq) * math.exp(-decay_constant * t)
            
            # Amplitude envelope: volume drops over time
            amplitude = math.exp(-volume_decay * t)
            
            # Pulse/Click at the very start (0-5ms) to add punch
            if t < 0.005:
                # Add a bit of noise/click
                click = math.sin(2 * math.pi * 1000 * t) * 0.5
                sample_val = (math.sin(phase) + click) * amplitude
            else:
                sample_val = math.sin(phase) * amplitude
            
            # Accumulate phase based on current frequency
            phase += 2 * math.pi * current_freq / sample_rate
            
            # Bound and convert to 16-bit integer
            sample_val = max(-1.0, min(1.0, sample_val))
            int_sample = int(sample_val * 32767)
            
            wav_file.writeframes(struct.pack('<h', int_sample))

if __name__ == "__main__":
    output_path = os.path.join("public", "audio", "kick.wav")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    print(f"Generating kick sample at {output_path}...")
    generate_kick(output_path)
    print("Done!")
