import Component from "@ember/component";
import layout from "../templates/components/cf-navigation";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import { ComponentQueryManager } from "ember-apollo-client";
import { task } from "ember-concurrency";
import getNavigationQuery from "ember-caluma/gql/queries/get-navigation";

export default Component.extend(ComponentQueryManager, {
  layout,
  documentStore: service(),

  documentId: null,
  document: null,
  activeDocumentId: null,

  didReceiveAttrs() {
    this._super(...arguments);
    if (this.documentId) {
      this.data.perform();
    }
  },

  data: task(function*() {
    return yield this.apollo.watchQuery(
      {
        query: getNavigationQuery,
        variables: { id: window.btoa("Document:" + this.documentId) },
        fetchPolicy: "network-only"
      },
      "node"
    );
  }),

  _document: computed("data.lastSuccessful.value", "document.id", function() {
    return (
      this.get("document") ||
      (this.get("data.lastSuccessful.value") &&
        this.documentStore.find(this.get("data.lastSuccessful.value")))
    );
  }).readOnly(),

  fields: computed("_document", function() {
    const isFormQuestion = field =>
      field.question.__typename === "FormQuestion";
    return (this.get("_document.fields") || [])
      .filter(isFormQuestion)
      .map(field => {
        field.set(
          "navSubFields",
          field.childDocument.fields.filter(isFormQuestion)
        );
        return field;
      });
  })
});
