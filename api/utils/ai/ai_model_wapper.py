from grpc.beta import implementations
from .apis import (prediction_service_pb2, predict_pb2, dtypes, tensor_pb2,
                  tensor_util)


class ModelParams(object):
    UNKNOWN_THRESHOLD = 0.1
    UNKNOWN_CLASS_ID = 2


class ModelWrapper(object):
    def __init__(self, adr, port, model_spec_name, model_spec_sig, image_key):
        self.adr = adr
        self.port = int(port)
        self.model_spec_name = model_spec_name
        self.model_spec_sig = model_spec_sig
        self.image_key = image_key

        self.channel = None
        self.stub = None
        self.reset_channel()

    def reset_channel(self):
        """Create new channel and stub."""
        self.channel = implementations.insecure_channel(self.adr, self.port)
        self.stub = prediction_service_pb2.beta_create_PredictionService_stub(self.channel)

    def predict(self, data, timeout=10.0):
        """Make a gRPC call to predict recycle/non-recycle from an image data.
        Args:
            data: string of bytes of the image (in JPEG format).
            timeout: float number of seconds before timeout gRPC call.
        Returns:
            class_id: 0 for non-recyclable, 1 for recyclable, 2 for unknown
            prob: float in range [0.0, 1.0] represents the confidence of the
                prediction.
        """
        request = predict_pb2.PredictRequest()
        request.model_spec.name = self.model_spec_name
        request.model_spec.signature_name = self.model_spec_sig
        request.inputs[self.image_key].CopyFrom(
            tensor_util.make_tensor_proto([data]))

        try:
            result = self.stub.Predict(request, timeout)
        except:
            print("Error calling gRPC prediction method")
            return ModelParams.UNKNOWN_CLASS_ID, 0.0

        prob = tensor_util.MakeNdarray(result.outputs["prob"])[0]
        class_id = tensor_util.MakeNdarray(result.outputs["binary_class_id"])[0]

        if prob < ModelParams.UNKNOWN_THRESHOLD:
            class_id = ModelParams.UNKNOWN_CLASS_ID

        return class_id, prob
