from api.utils.ai.ai_model_wapper import ModelWrapper
from api.models import Image


def stream_to_ai_server(result_model, data, key1, key2):
    adr = "35.198.234.42"
    port = 9001
    model_spec_name = 'recycle'
    model_spec_sig = 'scores'
    image_key = 'image'
    model = ModelWrapper(adr, port, model_spec_name, model_spec_sig, image_key)
    res = model.predict(data)
    result_model[key1] = res[0]
    result_model[key2] = res[1]


def perform_create(serializer):
    serializer.is_valid(raise_exception=True)
    serializer.save()
