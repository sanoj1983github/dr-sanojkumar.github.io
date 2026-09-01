# Smart Vision models and limitations

All inference runs in the browser. Camera frames are not recorded, stored or uploaded. Model files are served by this site. Camera permission and HTTPS (or localhost) are required.

## Bundled models

- **COCO-SSD 2.2.3, SSDLite MobileNet v2** recognizes 80 common COCO categories, not arbitrary objects. The detection threshold is 45%. [Official model documentation](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd). Apache 2.0.
- **@vladmandic/face-api 1.7.15** provides Tiny Face Detector, 68-point face alignment, and the pretrained age network. Gender output is discarded. Identity recognition, face embeddings, emotion and ethnicity models are not loaded. [Model documentation](https://github.com/justadudewhohacks/face-api.js/#age-estimation-and-gender-recognition). MIT.
- **MediaPipe Hands** estimates 21 landmarks per hand, up to two hands. Finger counts and gestures use landmark geometry. Apache 2.0.

Objects are enabled by default; hands and faces are optional. Models load one at a time after an explicit camera-start action. Model weights have not been retrained in this project.

## Tracking

Object IDs use category, overlap, proximity and estimated velocity. Motion prediction is limited to 250 milliseconds. A short detector gap can show a dashed TRACKING box; stale boxes disappear after a bounded grace period. IDs are temporary associations, not identities, and can still change or swap during occlusion or complex movement.

Boxes update immediately after object inference, without waiting for face analysis. A separate animation loop redraws the overlays, and labels use display-pixel sizing so they stay readable on small screens. This does not increase the model's inference frame rate.

## Estimated age

The displayed number, for example “≈ 27 years”, is an approximate visual estimate, not verified chronological age. It can be wrong by several years. Appearance alone cannot establish an exact birth date or age; do not use this feature for age verification or other consequential decisions.

Face analysis uses a separate capture up to 960 pixels wide and a 320-pixel detector input. Checks reject low-confidence, small, cropped, turned, poorly exposed or blurred faces. A rolling median combines up to nine accepted aligned readings; a number appears after at least three readings. An empty face observation resets the sample history.

Quality checks are conservative image heuristics, not a calibrated confidence score. Combining readings can reduce fluctuation but cannot remove model bias. These changes have not been shown to improve age accuracy on a held-out real-world dataset.

### What retraining requires

No age-labeled training dataset was supplied. Meaningful retraining requires:

1. Images the project is authorized to use, with consent and reliable age-at-capture labels.
2. Separate training, validation and test sets with no person appearing in more than one split.
3. An agreed compute budget and model license, and a deployment-size/performance target.
4. Evaluation against the current model using mean absolute error, error by age range and lighting, and performance on the intended cameras.

A newly trained model should replace the current weights only after that evaluation demonstrates a benefit. Neither training nor a perfect-age guarantee is claimed here.

## Other limits

Photos, posters and displays can produce detections. Source classification is a tentative screen-containment heuristic; it does not prove liveness. Use the source selector when the source is known.

Hands can be miscounted under occlusion or unusual poses. Gesture animations are debounced. Analysis is serial and face analysis is throttled; slow devices can still pause during model inference, especially with CPU fallback.

Pause retains the camera stream. Stop, Back to Vision Pen, hiding the tab or navigating away releases it. This is a computer-vision demonstration, not a safety, medical, identity or surveillance system.

Designed and developed by **Dr. Mritunjay Shall Peelam**.
