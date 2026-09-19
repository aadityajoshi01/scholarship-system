import easyocr

_reader = None


def get_reader():
    global _reader

    if _reader is None:
        _reader = easyocr.Reader(["en", "hi"], gpu=False)

    return _reader


def process_ocr(file_path: str):
    reader = get_reader()
    results = reader.readtext(file_path)

    text_parts = []
    confidence_values = []

    for _, text, confidence in results:
        text_parts.append(text)
        confidence_values.append(float(confidence))

    average_confidence = (
        sum(confidence_values) / len(confidence_values)
        if confidence_values
        else 0
    )

    return {
        "text": " ".join(text_parts),
        "language": "multi",
        "confidence": round(average_confidence, 3),
        "detectedTextCount": len(text_parts)
    }
