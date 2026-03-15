def serialize_mongo(document):
    document["_id"] = str(document["_id"])
    return document


def serialize_list(documents):
    return [serialize_mongo(doc) for doc in documents]

