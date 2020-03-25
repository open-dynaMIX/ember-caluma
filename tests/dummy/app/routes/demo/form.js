import Route from "@ember/routing/route";
import { queryManager } from "ember-apollo-client";
import gql from "graphql-tag";

export default Route.extend({
  apollo: queryManager(),

  async model() {
    const documents = await this.apollo.query(
      {
        fetchPolicy: "network-only",
        query: gql`
          query {
            allDocuments(form: "formular-1") {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      },
      "allDocuments.edges"
    );

    if (!documents.length) {
      return await this.apollo.mutate(
        {
          mutation: gql`
            mutation($input: SaveDocumentInput!) {
              saveDocument(input: $input) {
                document {
                  id
                }
              }
            }
          `,
          variables: {
            input: {
              form: "formular-1",
            },
          },
        },
        "saveDocument.document.id"
      );
    }

    return documents[0].node.id;
  },
});
