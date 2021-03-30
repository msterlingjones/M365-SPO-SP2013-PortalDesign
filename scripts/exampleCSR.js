// The file has been created, saved into "/Style Library/"
// and attached to the XLV via JSLink property.

SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {

  function getBaseHtml(ctx) {
    return SPClientTemplates["_defaultTemplates"].Fields.default.all.all[ctx.CurrentFieldSchema.FieldType][ctx.BaseViewID](ctx);
  }

  function init() {

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides({

      // OnPreRender: function(ctx) { },

      Templates: {

      //     View: function(ctx) { return ""; },
      //     Header: function(ctx) { return ""; },
      //     Body: function(ctx) { return ""; },
      //     Group: function(ctx) { return ""; },
      //     Item: function(ctx) { return ""; },
      //     Fields: {
      //         "<field internal name>": {
      //             View: function(ctx) { return ""; },
      //             EditForm: function(ctx) { return ""; },
      //             DisplayForm: function(ctx) { return ""; },
      //             NewForm: function(ctx) { return ""; }
      //         }
      //     },
      //     Footer: function(ctx) { return ""; }

      },

      // OnPostRender: function(ctx) { },

      ListTemplateType: 101

    });
  }

  RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens("~siteCollection/Style Library/example.js"), init);
  init();

});
