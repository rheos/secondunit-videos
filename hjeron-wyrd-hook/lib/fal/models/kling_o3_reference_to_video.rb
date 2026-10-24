require_relative "base"

module Fal
  module Models
    # https://fal.ai/models/fal-ai/kling-video/o3/pro/reference-to-video — a clip that starts on a keyframe and keeps the
    # character bound to its sheet for the whole clip: elements = [{frontal_image_url, reference_image_urls (1-3)}],
    # named @Element1.. in the prompt. Used when H3 (first frame only) lets a character drift off its sheet.
    class KlingO3ReferenceToVideo < Base
      ENDPOINT = "fal-ai/kling-video/o3/pro/reference-to-video".freeze
      DEFAULTS = { aspect_ratio: "16:9", generate_audio: false }.freeze

      def animate(prompt:, start_image_url:, elements:, duration:, end_image_url: nil, **opts)
        call(prompt: prompt, start_image_url: start_image_url, end_image_url: end_image_url, elements: elements,
             duration: duration.to_s, **opts)
      end
    end
  end
end
